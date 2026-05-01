package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"

	"nafasi_new/back_nafasi/routes"
)

func main() {
	ctx := context.Background()

	if err := loadEnv(".env"); err != nil {
		log.Printf("env file not loaded: %v", err)
	}

	db, err := ConnectDB(ctx)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()

	if err := MigrateDB(ctx, db); err != nil {
		log.Fatalf("database migration failed: %v", err)
	}

	if err := SeedOwner(ctx, db); err != nil {
		log.Fatalf("owner seed failed: %v", err)
	}

	authHandler := routes.NewAuthHandler(db)
	featureHandler := routes.NewFeatureHandler(db)
	mailer := routes.NewMailerFromEnv()
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /auth/signup", authHandler.SignUp)
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	mux.HandleFunc("POST /mail/subscription", mailer.SubscriptionInterest)
	mux.Handle("GET /auth/me", authHandler.RequireRole(http.HandlerFunc(authHandler.Me), "system_admin", "admin", "provider", "customer"))
	mux.Handle("GET /admin/users", authHandler.RequireRole(http.HandlerFunc(authHandler.ListUsers), "system_admin", "admin"))
	mux.Handle("GET /api/rentals", authHandler.RequireRole(http.HandlerFunc(featureHandler.ListRentals), "system_admin", "admin", "provider", "customer"))
	mux.Handle("POST /api/rentals", authHandler.RequireRole(http.HandlerFunc(featureHandler.CreateRental), "system_admin", "admin", "provider"))
	mux.Handle("GET /api/warehouses", authHandler.RequireRole(http.HandlerFunc(featureHandler.ListWarehouses), "system_admin", "admin", "provider", "customer"))
	mux.Handle("POST /api/warehouses", authHandler.RequireRole(http.HandlerFunc(featureHandler.CreateWarehouse), "system_admin", "admin", "provider"))
	mux.Handle("GET /api/spaces", authHandler.RequireRole(http.HandlerFunc(featureHandler.ListSpaces), "system_admin", "admin", "provider", "customer"))
	mux.Handle("POST /api/spaces", authHandler.RequireRole(http.HandlerFunc(featureHandler.CreateSpace), "system_admin", "admin", "provider"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           withCORS(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("nafasi api listening on :%s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigins := splitCSV(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func contains(values []string, needle string) bool {
	for _, value := range values {
		if value == needle {
			return true
		}
	}
	return false
}

func loadEnv(path string) error {
	content, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"`)

		if key != "" {
			os.Setenv(key, value)
		}
	}

	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	routes.WriteJSON(w, status, payload)
}
