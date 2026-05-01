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

type AuthHandler struct {
	db *sql.DB
}

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type contextKey string

const userContextKey contextKey = "nafasi_user"

var allowedRoles = map[string]bool{
	"system_admin": true,
	"admin":        true,
	"provider":     true,
	"customer":     true,
}

func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Role = strings.TrimSpace(req.Role)
	if req.Role == "" {
		req.Role = "customer"
	}

	if req.Name == "" || req.Email == "" || len(req.Password) < 8 || (req.Role != "customer" && req.Role != "provider") {
		writeError(w, http.StatusBadRequest, "Name, valid email, password of at least 8 characters, and customer or provider role are required")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not secure password")
		return
	}

	user := User{}
	err = h.db.QueryRowContext(
		r.Context(),
		`INSERT INTO users (name, email, password_hash, role)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, email, role, created_at`,
		req.Name,
		req.Email,
		string(hash),
		req.Role,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "users_email_key") {
			writeError(w, http.StatusConflict, "An account with this email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}

	token, expiresAt, err := h.createSession(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create session")
		return
	}

	WriteJSON(w, http.StatusCreated, map[string]any{
		"token":     token,
		"expiresAt": expiresAt,
		"user":      user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var passwordHash string
	user := User{}
	err := h.db.QueryRowContext(
		r.Context(),
		`SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
		req.Email,
	).Scan(&user.ID, &user.Name, &user.Email, &passwordHash, &user.Role, &user.CreatedAt)

	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not log in")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, expiresAt, err := h.createSession(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create session")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{
		"token":     token,
		"expiresAt": expiresAt,
		"user":      user,
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{"user": user})
}

func (h *AuthHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.QueryContext(
		r.Context(),
		`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load users")
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		user := User{}
		if err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read users")
			return
		}
		users = append(users, user)
	}

	WriteJSON(w, http.StatusOK, map[string]any{"users": users})
}

func (h *AuthHandler) RequireRole(next http.Handler, roles ...string) http.Handler {
	allowed := map[string]bool{}
	for _, role := range roles {
		allowed[role] = true
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := bearerToken(r.Header.Get("Authorization"))
		if token == "" {
			writeError(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		user, err := h.userForToken(r.Context(), token)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "Invalid or expired session")
			return
		}

		if !allowed[user.Role] {
			writeError(w, http.StatusForbidden, "This role cannot access this resource")
			return
		}

		ctx := context.WithValue(r.Context(), userContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserFromContext(ctx context.Context) (User, bool) {
	user, ok := ctx.Value(userContextKey).(User)
	return user, ok
}

func (h *AuthHandler) createSession(ctx context.Context, userID int64) (string, time.Time, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", time.Time{}, err
	}

	token := base64.RawURLEncoding.EncodeToString(tokenBytes)
	tokenHash := hashToken(token)
	expiresAt := time.Now().UTC().Add(24 * time.Hour)

	_, err := h.db.ExecContext(
		ctx,
		`INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID,
		tokenHash,
		expiresAt,
	)
	return token, expiresAt, err
}

func (h *AuthHandler) userForToken(ctx context.Context, token string) (User, error) {
	user := User{}
	err := h.db.QueryRowContext(
		ctx,
		`SELECT u.id, u.name, u.email, u.role, u.created_at
		 FROM auth_sessions s
		 JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
		hashToken(token),
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)

	return user, err
}

func bearerToken(header string) string {
	prefix := "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, prefix))
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}
