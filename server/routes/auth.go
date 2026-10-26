package routes

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"nafasi_new/back_nafasi/model"
	"nafasi_new/back_nafasi/service"
)

type AuthHandler struct {
	auth *service.Auth
}

type User = model.User

type contextKey string

const userContextKey contextKey = "nafasi_user"

func NewAuthHandler(auth *service.Auth) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	var input model.UserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	session, err := h.auth.SignUp(r.Context(), input)
	if err != nil {
		writeAuthError(w, err, "Could not create account")
		return
	}
	WriteJSON(w, http.StatusCreated, session)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input model.UserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	session, err := h.auth.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		writeAuthError(w, err, "Could not log in")
		return
	}
	WriteJSON(w, http.StatusOK, session)
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
	users, err := h.auth.ListUsers(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load users")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"users": users})
}

func (h *AuthHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	actor, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input model.UserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	user, err := h.auth.CreateUser(r.Context(), actor.ID, input)
	if err != nil {
		writeAuthError(w, err, "Could not create user")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]any{"user": user})
}

func (h *AuthHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	actor, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	userID := strings.TrimSpace(r.PathValue("id"))
	var input model.UserRoleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if userID == "" {
		writeError(w, http.StatusBadRequest, "User id and valid role are required")
		return
	}
	user, err := h.auth.UpdateUserRole(r.Context(), actor.ID, userID, input.Role)
	if err != nil {
		writeAuthError(w, err, "Could not update role")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"user": user})
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
		user, err := h.auth.UserForToken(r.Context(), token)
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

func bearerToken(header string) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, prefix))
}

func writeAuthError(w http.ResponseWriter, err error, fallback string) {
	var authErr *service.AuthError
	if !errors.As(err, &authErr) {
		writeError(w, http.StatusInternalServerError, fallback)
		return
	}
	switch authErr.Kind {
	case "validation":
		writeError(w, http.StatusBadRequest, authErr.Message)
	case "unauthorized":
		writeError(w, http.StatusUnauthorized, authErr.Message)
	case "not_found":
		writeError(w, http.StatusNotFound, authErr.Message)
	case "conflict":
		writeError(w, http.StatusConflict, authErr.Message)
	default:
		writeError(w, http.StatusInternalServerError, fallback)
	}
}
