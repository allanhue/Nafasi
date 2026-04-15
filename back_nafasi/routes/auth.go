package routes

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db *sql.DB
}

func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{db: db}
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	PlanID   int    `json:"plan_id"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type PlanResponse struct {
	ID            int                    `json:"id"`
	Name          string                 `json:"name"`
	Description   string                 `json:"description"`
	Price         float64                `json:"price"`
	BillingPeriod string                 `json:"billing_period"`
	Features      map[string]interface{} `json:"features"`
}

type UserResponse struct {
	ID    string   `json:"id"`
	Name  string   `json:"name"`
	Email string   `json:"email"`
	Roles []string `json:"roles"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

func (s *AuthService) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Name == "" || req.Email == "" || len(req.Password) < 8 {
		respondError(w, http.StatusBadRequest, "name, email, and password are required")
		return
	}
	if !strings.Contains(req.Email, "@") {
		respondError(w, http.StatusBadRequest, "invalid email address")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var userID string
	err = s.db.QueryRowContext(ctx, `
		INSERT INTO users (name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id
	`, req.Name, req.Email, string(hash)).Scan(&userID)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			respondError(w, http.StatusConflict, "email already registered")
			return
		}
		respondError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	roleID, err := s.ensureRole(ctx, "user", "Default application user")
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not assign role")
		return
	}

	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, userID, roleID); err != nil {
		respondError(w, http.StatusInternalServerError, "could not assign role")
		return
	}

	// Assign default plan (Free) if no plan specified
	planID := req.PlanID
	if planID == 0 {
		planID = 1 // Default to Free plan
	}

	// Create subscription
	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO user_subscriptions (user_id, plan_id, status, expires_at)
		VALUES ($1, $2, 'active', NOW() + INTERVAL '30 day')
	`, userID, planID); err != nil {
		respondError(w, http.StatusInternalServerError, "could not create subscription")
		return
	}

	roles, _ := s.getUserRoles(ctx, userID)
	token, err := s.createSession(ctx, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not create session")
		return
	}

	respondJSON(w, http.StatusCreated, AuthResponse{
		Token: token,
		User: UserResponse{
			ID:    userID,
			Name:  req.Name,
			Email: req.Email,
			Roles: roles,
		},
	})
}

func (s *AuthService) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var (
		userID       string
		name         string
		email        string
		passwordHash string
	)
	err := s.db.QueryRowContext(ctx, `
		SELECT id, name, email, password_hash
		FROM users
		WHERE email = $1
	`, req.Email).Scan(&userID, &name, &email, &passwordHash)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := s.createSession(ctx, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not create session")
		return
	}

	roles, _ := s.getUserRoles(ctx, userID)

	respondJSON(w, http.StatusOK, AuthResponse{
		Token: token,
		User: UserResponse{
			ID:    userID,
			Name:  name,
			Email: email,
			Roles: roles,
		},
	})
}

func (s *AuthService) HandleMe(w http.ResponseWriter, r *http.Request) {
	token, err := bearerToken(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "missing token")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, name, email, err := s.userFromToken(ctx, token)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid session")
		return
	}

	roles, _ := s.getUserRoles(ctx, userID)
	respondJSON(w, http.StatusOK, UserResponse{
		ID:    userID,
		Name:  name,
		Email: email,
		Roles: roles,
	})
}

func (s *AuthService) ensureRole(ctx context.Context, name, description string) (int, error) {
	var id int
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO roles (name, description)
		VALUES ($1, $2)
		ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
		RETURNING id
	`, name, description).Scan(&id)
	return id, err
}

func (s *AuthService) getUserRoles(ctx context.Context, userID string) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT r.name
		FROM roles r
		INNER JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1
		ORDER BY r.name
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		roles = append(roles, name)
	}
	return roles, rows.Err()
}

func (s *AuthService) createSession(ctx context.Context, userID string) (string, error) {
	token, err := generateToken(32)
	if err != nil {
		return "", err
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO sessions (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`, userID, hashToken(token), expiresAt); err != nil {
		return "", err
	}

	return token, nil
}

func (s *AuthService) userFromToken(ctx context.Context, token string) (string, string, string, error) {
	var (
		userID string
		name   string
		email  string
	)
	err := s.db.QueryRowContext(ctx, `
		SELECT u.id, u.name, u.email
		FROM sessions s
		INNER JOIN users u ON u.id = s.user_id
		WHERE s.token_hash = $1 AND s.expires_at > now()
	`, hashToken(token)).Scan(&userID, &name, &email)
	if err != nil {
		return "", "", "", err
	}
	return userID, name, email, nil
}

func (s *AuthService) HandleLogout(w http.ResponseWriter, r *http.Request) {
	token, err := bearerToken(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err = s.db.ExecContext(ctx, `
		DELETE FROM sessions WHERE token_hash = $1
	`, hashToken(token))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "logout failed")
		return
	}

	_, _ = s.db.ExecContext(ctx, `
		DELETE FROM sessions WHERE token_hash = $1
	`, hashToken(token))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "logout failed")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "logged out successfully"})
}

func (s *AuthService) HandleGetPlans(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, description, price, billing_period, features
		FROM plans
		WHERE is_active = true
		ORDER BY price ASC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not fetch plans")
		return
	}
	defer rows.Close()

	var plans []PlanResponse
	for rows.Next() {
		var plan PlanResponse
		var features string

		if err := rows.Scan(&plan.ID, &plan.Name, &plan.Description, &plan.Price, &plan.BillingPeriod, &features); err != nil {
			respondError(w, http.StatusInternalServerError, "could not parse plans")
			return
		}

		// Parse JSON features
		if features != "" {
			if err := json.Unmarshal([]byte(features), &plan.Features); err != nil {
				plan.Features = make(map[string]interface{})
			}
		} else {
			plan.Features = make(map[string]interface{})
		}

		plans = append(plans, plan)
	}

	if plans == nil {
		plans = []PlanResponse{}
	}

	respondJSON(w, http.StatusOK, plans)
}

func (s *AuthService) HandleGetSubscription(w http.ResponseWriter, r *http.Request) {
	token, err := bearerToken(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "missing token")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	userID, _, _, err := s.userFromToken(ctx, token)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid session")
		return
	}

	var subscriptionData struct {
		PlanID    int    `json:"plan_id"`
		PlanName  string `json:"plan_name"`
		Status    string `json:"status"`
		StartedAt string `json:"started_at"`
		ExpiresAt string `json:"expires_at"`
	}

	err = s.db.QueryRowContext(ctx, `
		SELECT p.id, p.name, us.status, us.started_at, us.expires_at
		FROM user_subscriptions us
		INNER JOIN plans p ON p.id = us.plan_id
		WHERE us.user_id = $1
		ORDER BY us.created_at DESC
		LIMIT 1
	`, userID).Scan(&subscriptionData.PlanID, &subscriptionData.PlanName, &subscriptionData.Status, &subscriptionData.StartedAt, &subscriptionData.ExpiresAt)
	if err != nil {
		respondError(w, http.StatusNotFound, "no active subscription found")
		return
	}

	respondJSON(w, http.StatusOK, subscriptionData)
}

func bearerToken(r *http.Request) (string, error) {
	auth := r.Header.Get("Authorization")
	if auth == "" {
		return "", errors.New("missing auth header")
	}
	parts := strings.SplitN(auth, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", errors.New("invalid auth header")
	}
	return strings.TrimSpace(parts[1]), nil
}

func generateToken(length int) (string, error) {
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
