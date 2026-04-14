package main

import (
	"database/sql"
	"errors"
	"os"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

const (
	defaultOwnerRole = "superadmin"
)

func databaseURL() string {
	if url := strings.TrimSpace(os.Getenv("DATABASE_URL")); url != "" {
		return url
	}
	return strings.TrimSpace(os.Getenv("NEON_DATABASE_URL"))
}

func connectDatabase() (*sql.DB, error) {
	url := databaseURL()
	if url == "" {
		return nil, errors.New("DATABASE_URL or NEON_DATABASE_URL is not set")
	}

	db, err := sql.Open("pgx", url)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	if err := InitSchema(db); err != nil {
		db.Close()
		return nil, err
	}


	return db, nil
}

func InitSchema(db *sql.DB) error {
	statements := []string{
		`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
		`CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			description TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS permissions (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			description TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS role_permissions (
			role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			PRIMARY KEY (role_id, permission_id)
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS user_roles (
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			PRIMARY KEY (user_id, role_id)
		)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash TEXT UNIQUE NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL
		)`,
		// Rental tables
		`CREATE TABLE IF NOT EXISTS properties (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			address TEXT NOT NULL,
			units INT DEFAULT 0,
			occupied INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS tenants (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			email TEXT,
			phone TEXT,
			property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS payments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
			amount DECIMAL(10,2),
			status TEXT DEFAULT 'pending',
			due_date DATE,
			paid_date DATE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS maintenance_requests (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
			description TEXT,
			priority TEXT DEFAULT 'normal',
			status TEXT DEFAULT 'open',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		// Inventory tables
		`CREATE TABLE IF NOT EXISTS warehouses (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			location TEXT,
			capacity INT DEFAULT 0,
			used INT DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			sku TEXT UNIQUE,
			name TEXT NOT NULL,
			quantity INT DEFAULT 0,
			unit_price DECIMAL(10,2),
			warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS movements (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			product_id UUID REFERENCES products(id) ON DELETE CASCADE,
			from_warehouse UUID REFERENCES warehouses(id),
			to_warehouse UUID REFERENCES warehouses(id),
			quantity INT,
			movement_type TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		// Booking tables
		`CREATE TABLE IF NOT EXISTS spaces (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			location TEXT,
			capacity INT,
			price_per_day DECIMAL(10,2),
			status TEXT DEFAULT 'available',
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS bookings (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
			guest_name TEXT,
			start_date DATE,
			end_date DATE,
			status TEXT DEFAULT 'confirmed',
			total DECIMAL(10,2),
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS earnings (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
			booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
			amount DECIMAL(10,2),
			period TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
		// Notifications table
		`CREATE TABLE IF NOT EXISTS notifications (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title TEXT,
			message TEXT,
			type TEXT,
			read BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,
	}

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}

	alterStatements := []string{
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
		`ALTER TABLE roles ADD COLUMN IF NOT EXISTS description TEXT`,
		`ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description TEXT`,
		`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
	}

	for _, stmt := range alterStatements {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}

	if err := seedDefaultRoles(db); err != nil {
		return err
	}

	return nil
}

func seedDefaultRoles(db *sql.DB) error {
	if _, err := db.Exec(`INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING`, "user", "Default application user"); err != nil {
		return err
	}

	if _, err := db.Exec(`INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING`, defaultOwnerRole, "Platform super administrator"); err != nil {
		return err
	}

	if _, err := db.Exec(`INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING`, "admin.access", "Access administrator routes"); err != nil {
		return err
	}
	if _, err := db.Exec(`INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING`, "auth.manage", "Manage users and roles"); err != nil {
		return err
	}

	_, err := db.Exec(`
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id
		FROM roles r
		JOIN permissions p ON p.name IN ('admin.access', 'auth.manage')
		WHERE r.name = $1
		ON CONFLICT DO NOTHING
	`, defaultOwnerRole)
	return err
}

func seedOwner(db *sql.DB) error {
	ownerEmail := strings.ToLower(strings.TrimSpace(os.Getenv("OWNER_EMAIL")))
	ownerPassword := strings.TrimSpace(os.Getenv("OWNER_PASSWORD"))
	ownerName := strings.TrimSpace(os.Getenv("OWNER_NAME"))
	ownerRole := strings.TrimSpace(os.Getenv("OWNER_ROLE"))

	if ownerName == "" {
		ownerName = "System Owner"
	}
	if ownerRole == "" {
		ownerRole = defaultOwnerRole
	}

	if ownerEmail == "" || ownerPassword == "" {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(ownerPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	var userID string
	err = db.QueryRow(`
		INSERT INTO users (name, email, password_hash)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`, ownerName, ownerEmail, string(hash)).Scan(&userID)
	if err != nil {
		return err
	}

	var roleID int
	if err := db.QueryRow(`SELECT id FROM roles WHERE name = $1`, ownerRole).Scan(&roleID); err != nil {
		return err
	}

	_, err = db.Exec(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, roleID)
	return err
}

func (db *DB) CloseDB() {
	if db == nil {
		return
	}
	_ = db.Close()
}

type DB struct {
	*sql.DB
}

func ConnectDB() (*DB, error) {
	db, err := connectDatabase()
	if err != nil {
		return nil, err
	}
	return &DB{DB: db}, nil
}
