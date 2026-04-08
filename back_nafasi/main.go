package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"

	"back_nafasi/routes"
)

func main() {
	_ = godotenv.Load()

	db, err := ConnectDB()
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.CloseDB()

	mux := http.NewServeMux()
	routes.Register(mux, db.DB)

	handler := withCORS(mux)

	port := os.Getenv("PORT")
	if strings.TrimSpace(port) == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("API listening on :%s", port)
	log.Fatal(server.ListenAndServe())
}
