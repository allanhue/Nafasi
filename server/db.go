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
		`CREATE TABLE IF NOT EXISTS feature_items (
			id BIGSERIAL PRIMARY KEY,
			feature_key TEXT NOT NULL,
			section_key TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'active',
			location TEXT NOT NULL DEFAULT '',
			owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT feature_items_feature_check CHECK (feature_key IN ('rentals', 'warehouses', 'spaces'))
		)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_items_feature_key ON feature_items(feature_key)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_items_section_key ON feature_items(section_key)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_items_owner_id ON feature_items(owner_id)`,
		`CREATE TABLE IF NOT EXISTS feature_item_status_history (
			id BIGSERIAL PRIMARY KEY,
			feature_item_id BIGINT NOT NULL REFERENCES feature_items(id) ON DELETE CASCADE,
			feature_key TEXT NOT NULL,
			section_key TEXT NOT NULL,
			from_status TEXT NOT NULL DEFAULT '',
			to_status TEXT NOT NULL,
			changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_status_history_item_id ON feature_item_status_history(feature_item_id)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_status_history_feature ON feature_item_status_history(feature_key, section_key)`,
		`CREATE INDEX IF NOT EXISTS idx_feature_status_history_changed_at ON feature_item_status_history(changed_at)`,
		`CREATE TABLE IF NOT EXISTS sla_tasks (
			id BIGSERIAL PRIMARY KEY,
			feature_key TEXT NOT NULL,
			section_key TEXT NOT NULL DEFAULT '',
			feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'open',
			priority TEXT NOT NULL DEFAULT 'normal',
			owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			due_at TIMESTAMPTZ,
			completed_at TIMESTAMPTZ,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT sla_tasks_feature_check CHECK (feature_key IN ('rentals', 'warehouses', 'spaces', 'account', 'system')),
			CONSTRAINT sla_tasks_status_check CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
			CONSTRAINT sla_tasks_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sla_tasks_feature ON sla_tasks(feature_key, section_key)`,
		`CREATE INDEX IF NOT EXISTS idx_sla_tasks_owner_id ON sla_tasks(owner_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sla_tasks_due_at ON sla_tasks(due_at)`,
		`CREATE TABLE IF NOT EXISTS rental_viewings (
			id BIGSERIAL PRIMARY KEY,
			feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			property_item_id BIGINT REFERENCES feature_items(id) ON DELETE SET NULL,
			customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			provider_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			scheduled_at TIMESTAMPTZ,
			confirmed_at TIMESTAMPTZ,
			status TEXT NOT NULL DEFAULT 'requested',
			notes TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_rental_viewings_status ON rental_viewings(status)`,
		`CREATE TABLE IF NOT EXISTS rental_leases (
			id BIGSERIAL PRIMARY KEY,
			feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			property_item_id BIGINT REFERENCES feature_items(id) ON DELETE SET NULL,
			tenant_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			provider_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			monthly_rent NUMERIC(12,2) NOT NULL DEFAULT 0,
			deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
			start_date DATE,
			end_date DATE,
			payment_status TEXT NOT NULL DEFAULT 'pending',
			status TEXT NOT NULL DEFAULT 'draft',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_rental_leases_status ON rental_leases(status)`,
		`CREATE TABLE IF NOT EXISTS warehouse_capacity (
			id BIGSERIAL PRIMARY KEY,
			warehouse_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			total_sqm NUMERIC(12,2) NOT NULL DEFAULT 0,
			booked_sqm NUMERIC(12,2) NOT NULL DEFAULT 0,
			loading_access TEXT NOT NULL DEFAULT '',
			security_status TEXT NOT NULL DEFAULT 'unchecked',
			available_from DATE,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_warehouse_capacity_item_id ON warehouse_capacity(warehouse_item_id)`,
		`CREATE TABLE IF NOT EXISTS warehouse_rate_cards (
			id BIGSERIAL PRIMARY KEY,
			warehouse_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			rate_per_sqm NUMERIC(12,2) NOT NULL DEFAULT 0,
			billing_cycle TEXT NOT NULL DEFAULT 'monthly',
			minimum_term_days INT NOT NULL DEFAULT 30,
			active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_warehouse_rate_cards_item_id ON warehouse_rate_cards(warehouse_item_id)`,
		`CREATE TABLE IF NOT EXISTS storage_contracts (
			id BIGSERIAL PRIMARY KEY,
			feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			warehouse_item_id BIGINT REFERENCES feature_items(id) ON DELETE SET NULL,
			customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			provider_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			booked_sqm NUMERIC(12,2) NOT NULL DEFAULT 0,
			monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
			start_date DATE,
			end_date DATE,
			status TEXT NOT NULL DEFAULT 'draft',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_storage_contracts_status ON storage_contracts(status)`,
		`CREATE TABLE IF NOT EXISTS warehouse_billing_events (
			id BIGSERIAL PRIMARY KEY,
			storage_contract_id BIGINT REFERENCES storage_contracts(id) ON DELETE CASCADE,
			amount NUMERIC(12,2) NOT NULL DEFAULT 0,
			due_at DATE,
			paid_at TIMESTAMPTZ,
			status TEXT NOT NULL DEFAULT 'pending',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_warehouse_billing_events_status ON warehouse_billing_events(status)`,
		`CREATE TABLE IF NOT EXISTS venue_bookings (
			id BIGSERIAL PRIMARY KEY,
			feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			venue_item_id BIGINT REFERENCES feature_items(id) ON DELETE SET NULL,
			customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			provider_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			event_start TIMESTAMPTZ,
			event_end TIMESTAMPTZ,
			expected_guests INT NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'hold',
			setup_notes TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_venue_bookings_status ON venue_bookings(status)`,
		`CREATE INDEX IF NOT EXISTS idx_venue_bookings_window ON venue_bookings(event_start, event_end)`,
		`CREATE TABLE IF NOT EXISTS venue_calendar_conflicts (
			id BIGSERIAL PRIMARY KEY,
			venue_booking_id BIGINT REFERENCES venue_bookings(id) ON DELETE CASCADE,
			conflicting_booking_id BIGINT REFERENCES venue_bookings(id) ON DELETE SET NULL,
			severity TEXT NOT NULL DEFAULT 'warning',
			notes TEXT NOT NULL DEFAULT '',
			resolved_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS ticket_tiers (
			id BIGSERIAL PRIMARY KEY,
			event_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			price NUMERIC(12,2) NOT NULL DEFAULT 0,
			quantity_total INT NOT NULL DEFAULT 0,
			quantity_reserved INT NOT NULL DEFAULT 0,
			sales_close_at TIMESTAMPTZ,
			active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_item_id ON ticket_tiers(event_item_id)`,
		`CREATE TABLE IF NOT EXISTS ticket_check_ins (
			id BIGSERIAL PRIMARY KEY,
			ticket_tier_id BIGINT REFERENCES ticket_tiers(id) ON DELETE CASCADE,
			customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			checked_in_at TIMESTAMPTZ,
			status TEXT NOT NULL DEFAULT 'reserved',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_ticket_check_ins_status ON ticket_check_ins(status)`,
		`CREATE TABLE IF NOT EXISTS ticket_refunds (
			id BIGSERIAL PRIMARY KEY,
			ticket_tier_id BIGINT REFERENCES ticket_tiers(id) ON DELETE CASCADE,
			customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			amount NUMERIC(12,2) NOT NULL DEFAULT 0,
			reason TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'requested',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			resolved_at TIMESTAMPTZ
		)`,
		`CREATE INDEX IF NOT EXISTS idx_ticket_refunds_status ON ticket_refunds(status)`,
		`CREATE TABLE IF NOT EXISTS event_requirements (
			id BIGSERIAL PRIMARY KEY,
			event_item_id BIGINT REFERENCES feature_items(id) ON DELETE CASCADE,
			requirement_type TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'missing',
			notes TEXT NOT NULL DEFAULT '',
			due_at TIMESTAMPTZ,
			completed_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_event_requirements_event_item_id ON event_requirements(event_item_id)`,
		`CREATE TABLE IF NOT EXISTS calendar_items (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			feature_key TEXT NOT NULL DEFAULT 'account',
			item_type TEXT NOT NULL DEFAULT 'reference',
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			location TEXT NOT NULL DEFAULT '',
			start_at TIMESTAMPTZ NOT NULL,
			end_at TIMESTAMPTZ,
			reminder_at TIMESTAMPTZ,
			related_feature_item_id BIGINT REFERENCES feature_items(id) ON DELETE SET NULL,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT calendar_items_feature_check CHECK (feature_key IN ('rentals', 'warehouses', 'spaces', 'account'))
		)`,
		`CREATE INDEX IF NOT EXISTS idx_calendar_items_user_start ON calendar_items(user_id, start_at)`,
		`CREATE INDEX IF NOT EXISTS idx_calendar_items_feature ON calendar_items(feature_key)`,
		`CREATE TABLE IF NOT EXISTS maintenance_windows (
			id BIGSERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			start_at TIMESTAMPTZ NOT NULL,
			end_at TIMESTAMPTZ,
			status TEXT NOT NULL DEFAULT 'scheduled',
			created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT maintenance_windows_status_check CHECK (status IN ('scheduled', 'updated', 'cancelled', 'completed'))
		)`,
		`CREATE INDEX IF NOT EXISTS idx_maintenance_windows_start ON maintenance_windows(start_at)`,
		`CREATE INDEX IF NOT EXISTS idx_maintenance_windows_status ON maintenance_windows(status)`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
			feature_key TEXT NOT NULL DEFAULT 'system',
			title TEXT NOT NULL,
			body TEXT NOT NULL DEFAULT '',
			kind TEXT NOT NULL DEFAULT 'system',
			read_at TIMESTAMPTZ,
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`,
		`CREATE TABLE IF NOT EXISTS audit_logs (
			id BIGSERIAL PRIMARY KEY,
			actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
			action TEXT NOT NULL,
			entity_type TEXT NOT NULL,
			entity_id TEXT NOT NULL DEFAULT '',
			summary TEXT NOT NULL DEFAULT '',
			metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)`,
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
