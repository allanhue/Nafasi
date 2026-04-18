package main

import (
	"log"
	"net/http"
	"os"
	"strings"
)

func withCORS(next http.Handler) http.Handler {
	allowed := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	allowedOrigins := map[string]bool{}
	if allowed != "" {
		for _, origin := range strings.Split(allowed, ",") {
			allowedOrigins[strings.TrimSpace(origin)] = true
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && (len(allowedOrigins) == 0 || allowedOrigins[origin]) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[%s] %s %s", r.Method, r.RequestURI, r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}
