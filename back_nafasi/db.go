package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const defaultOwnerRole = "system_admin"

func ConnectDB(ctx context.Context) (*sql.DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, errors.New("DATABASE_URL is not set")
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(30 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := db.PingContext(pingCtx); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}

func MigrateDB(ctx context.Context, db *sql.DB) error {
	statements := []string{
		`CREATE EXTENSION IF NOT EXISTS citext`,
		`CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email CITEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'customer',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT users_role_check CHECK (role IN ('system_admin', 'admin', 'provider', 'customer'))
		)`,
		`CREATE TABLE IF NOT EXISTS auth_sessions (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash TEXT NOT NULL UNIQUE,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at)`,
		`CREATE TABLE IF NOT EXISTS role_permissions (
			role TEXT NOT NULL,
			feature_key TEXT NOT NULL,
			can_read BOOLEAN NOT NULL DEFAULT TRUE,
			can_write BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (role, feature_key),
			CONSTRAINT role_permissions_role_check CHECK (role IN ('system_admin', 'admin', 'provider', 'customer')),
			CONSTRAINT role_permissions_feature_check CHECK (feature_key IN ('rentals', 'warehouses', 'spaces', 'dashboard', 'account'))
		)`,
		`INSERT INTO role_permissions (role, feature_key, can_read, can_write) VALUES
			('system_admin', 'rentals', TRUE, TRUE),
			('system_admin', 'warehouses', TRUE, TRUE),
			('system_admin', 'spaces', TRUE, TRUE),
			('system_admin', 'dashboard', TRUE, TRUE),
			('system_admin', 'account', TRUE, TRUE),
			('admin', 'rentals', TRUE, TRUE),
			('admin', 'warehouses', TRUE, TRUE),
			('admin', 'spaces', TRUE, TRUE),
			('admin', 'dashboard', TRUE, TRUE),
			('admin', 'account', TRUE, TRUE),
			('provider', 'rentals', TRUE, TRUE),
			('provider', 'warehouses', TRUE, TRUE),
			('provider', 'spaces', TRUE, TRUE),
			('provider', 'dashboard', TRUE, FALSE),
			('provider', 'account', TRUE, TRUE),
			('customer', 'rentals', TRUE, FALSE),
			('customer', 'warehouses', TRUE, FALSE),
			('customer', 'spaces', TRUE, FALSE),
			('customer', 'dashboard', TRUE, FALSE),
			('customer', 'account', TRUE, TRUE)
		ON CONFLICT (role, feature_key) DO NOTHING`,
	}

	for _, statement := range statements {
		if _, err := db.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	return nil
}

func SeedOwner(ctx context.Context, db *sql.DB) error {
	email := os.Getenv("OWNER_EMAIL")
	password := os.Getenv("OWNER_PASSWORD")
	name := os.Getenv("OWNER_NAME")
	role := os.Getenv("OWNER_ROLE")

	if email == "" || password == "" {
		return nil
	}
	if name == "" {
		name = "System Admin"
	}
	if role == "" {
		role = defaultOwnerRole
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.ExecContext(
		ctx,
		`INSERT INTO users (name, email, password_hash, role)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (email) DO NOTHING`,
		name,
		email,
		string(hash),
		role,
	)
	return err
}
