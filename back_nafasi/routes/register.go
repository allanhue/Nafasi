package routes

import (
	"database/sql"
	"net/http"
)

func Register(mux *http.ServeMux, db *sql.DB) {
	auth := NewAuthService(db)

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /auth/register", auth.HandleRegister)
	mux.HandleFunc("POST /auth/login", auth.HandleLogin)
	mux.HandleFunc("GET /auth/me", auth.HandleMe)
}
