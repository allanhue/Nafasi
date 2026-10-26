package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"nafasi_new/back_nafasi/model"
)

type AuthError struct {
	Kind    string
	Message string
}

func (e *AuthError) Error() string {
	return e.Message
}

type Auth struct {
	repository *model.Auth
	operations *Operations
}

func NewAuth(repository *model.Auth, operations *Operations) *Auth {
	return &Auth{repository: repository, operations: operations}
}

func (s *Auth) SignUp(ctx context.Context, input model.UserInput) (model.AuthSession, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Email = normalizeEmail(input.Email)
	input.Role = strings.TrimSpace(input.Role)
	if input.Role == "" {
		input.Role = "customer"
	}
	if input.Name == "" || input.Email == "" || len(input.Password) < 8 ||
		(input.Role != "customer" && input.Role != "provider") {
		return model.AuthSession{}, &AuthError{Kind: "validation", Message: "Name, valid email, password of at least 8 characters, and customer or provider role are required"}
	}
	user, err := s.createUser(ctx, input)
	if err != nil {
		return model.AuthSession{}, err
	}
	return s.createSession(ctx, user)
}

func (s *Auth) CreateUser(ctx context.Context, actorID int64, input model.UserInput) (model.User, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Email = normalizeEmail(input.Email)
	input.Role = strings.TrimSpace(input.Role)
	if input.Name == "" || input.Email == "" || len(input.Password) < 8 || !allowedRole(input.Role) {
		return model.User{}, &AuthError{Kind: "validation", Message: "Name, valid email, password of at least 8 characters, and valid role are required"}
	}
	user, err := s.createUser(ctx, input)
	if err != nil {
		return user, err
	}
	s.recordUserChange(ctx, actorID, user, "user.created", "Created user "+user.Email, "Account created",
		"Your Nafasi account was created with the "+user.Role+" role.")
	return user, nil
}

func (s *Auth) Login(ctx context.Context, email, password string) (model.AuthSession, error) {
	credential, err := s.repository.UserCredentialByEmail(ctx, normalizeEmail(email))
	if errors.Is(err, sql.ErrNoRows) || (err == nil && bcrypt.CompareHashAndPassword([]byte(credential.PasswordHash), []byte(password)) != nil) {
		return model.AuthSession{}, &AuthError{Kind: "unauthorized", Message: "Invalid email or password"}
	}
	if err != nil {
		return model.AuthSession{}, err
	}
	return s.createSession(ctx, credential.User)
}

func (s *Auth) ListUsers(ctx context.Context) ([]model.User, error) {
	return s.repository.ListUsers(ctx)
}

func (s *Auth) UpdateUserRole(ctx context.Context, actorID int64, rawID, role string) (model.User, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(rawID), 10, 64)
	role = strings.TrimSpace(role)
	if err != nil || id <= 0 || !allowedRole(role) {
		return model.User{}, &AuthError{Kind: "validation", Message: "User id and valid role are required"}
	}
	user, err := s.repository.UpdateUserRole(ctx, id, role)
	if errors.Is(err, sql.ErrNoRows) {
		return model.User{}, &AuthError{Kind: "not_found", Message: "User not found"}
	}
	if err == nil {
		s.recordUserChange(ctx, actorID, user, "user.role_updated", "Updated role for "+user.Email, "Role updated",
			"Your Nafasi role is now "+user.Role+".")
	}
	return user, err
}

func (s *Auth) recordUserChange(ctx context.Context, actorID int64, user model.User, action, summary, title, body string) {
	if s.operations == nil {
		return
	}
	metadata, err := json.Marshal(map[string]string{"role": user.Role, "email": user.Email})
	if err != nil {
		log.Printf("user change metadata encoding failed user_id=%d: %v", user.ID, err)
		return
	}
	if err := s.operations.RecordAudit(ctx, actorID, action, "user", IDString(user.ID), summary, metadata); err != nil {
		log.Printf("user change audit failed user_id=%d action=%s: %v", user.ID, action, err)
	}
	if err := s.operations.CreateNotification(ctx, &user.ID, "account", title, body, "system", metadata); err != nil {
		log.Printf("user change notification failed user_id=%d action=%s: %v", user.ID, action, err)
	}
}

func (s *Auth) UserForToken(ctx context.Context, token string) (model.User, error) {
	return s.repository.UserForToken(ctx, hashToken(token))
}

func (s *Auth) createUser(ctx context.Context, input model.UserInput) (model.User, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return model.User{}, err
	}
	user, err := s.repository.CreateUser(ctx, input, string(passwordHash))
	if err != nil && strings.Contains(err.Error(), "users_email_key") {
		return model.User{}, &AuthError{Kind: "conflict", Message: "An account with this email already exists"}
	}
	return user, err
}

func (s *Auth) createSession(ctx context.Context, user model.User) (model.AuthSession, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return model.AuthSession{}, err
	}
	token := base64.RawURLEncoding.EncodeToString(tokenBytes)
	expiresAt := time.Now().UTC().Add(24 * time.Hour)
	if err := s.repository.CreateSession(ctx, user.ID, hashToken(token), expiresAt); err != nil {
		return model.AuthSession{}, err
	}
	return model.AuthSession{Token: token, ExpiresAt: expiresAt, User: user}, nil
}

func allowedRole(role string) bool {
	switch role {
	case "system_admin", "admin", "provider", "customer":
		return true
	default:
		return false
	}
}

func normalizeEmail(email string) string {
	return strings.TrimSpace(strings.ToLower(email))
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
