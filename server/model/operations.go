package model

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

type Notification struct {
	ID         int64           `json:"id"`
	UserID     sql.NullInt64   `json:"-"`
	FeatureKey string          `json:"featureKey"`
	Title      string          `json:"title"`
	Body       string          `json:"body"`
	Kind       string          `json:"kind"`
	ReadAt     sql.NullTime    `json:"-"`
	Metadata   json.RawMessage `json:"metadata"`
	CreatedAt  time.Time       `json:"createdAt"`
}

type AuditLog struct {
	ID         int64           `json:"id"`
	ActorID    sql.NullInt64   `json:"-"`
	Action     string          `json:"action"`
	EntityType string          `json:"entityType"`
	EntityID   string          `json:"entityId"`
	Summary    string          `json:"summary"`
	Metadata   json.RawMessage `json:"metadata"`
	CreatedAt  time.Time       `json:"createdAt"`
}

type Operations struct {
	db *sql.DB
}

func NewOperations(db *sql.DB) *Operations {
	return &Operations{db: db}
}

func (m *Operations) ListNotifications(ctx context.Context, userID int64) ([]Notification, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, user_id, feature_key, title, body, kind, read_at, metadata, created_at
		 FROM notifications WHERE user_id = $1 OR user_id IS NULL
		 ORDER BY created_at DESC LIMIT 50`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Notification{}
	for rows.Next() {
		var item Notification
		if err := rows.Scan(&item.ID, &item.UserID, &item.FeatureKey, &item.Title, &item.Body,
			&item.Kind, &item.ReadAt, &item.Metadata, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (m *Operations) MarkNotificationRead(ctx context.Context, userID, notificationID int64) (Notification, error) {
	item := Notification{}
	err := m.db.QueryRowContext(ctx,
		`UPDATE notifications SET read_at = NOW()
		 WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
		 RETURNING id, user_id, feature_key, title, body, kind, read_at, metadata, created_at`,
		notificationID, userID,
	).Scan(&item.ID, &item.UserID, &item.FeatureKey, &item.Title, &item.Body, &item.Kind,
		&item.ReadAt, &item.Metadata, &item.CreatedAt)
	return item, err
}

func (m *Operations) MarkAllNotificationsRead(ctx context.Context, userID int64) error {
	_, err := m.db.ExecContext(ctx,
		`UPDATE notifications SET read_at = COALESCE(read_at, NOW())
		 WHERE user_id = $1 OR user_id IS NULL`,
		userID,
	)
	return err
}

func (m *Operations) ListAuditLogs(ctx context.Context) ([]AuditLog, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, actor_id, action, entity_type, entity_id, summary, metadata, created_at
		 FROM audit_logs ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []AuditLog{}
	for rows.Next() {
		var item AuditLog
		if err := rows.Scan(&item.ID, &item.ActorID, &item.Action, &item.EntityType,
			&item.EntityID, &item.Summary, &item.Metadata, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (m *Operations) CreateNotification(ctx context.Context, userID *int64, featureKey, title, body, kind string, metadata json.RawMessage) error {
	var nullableUserID any
	if userID != nil {
		nullableUserID = *userID
	}
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	_, err := m.db.ExecContext(ctx,
		`INSERT INTO notifications (user_id, feature_key, title, body, kind, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		nullableUserID, featureKey, title, body, kind, metadata,
	)
	return err
}

func (m *Operations) RecordAudit(ctx context.Context, actorID int64, action, entityType, entityID, summary string, metadata json.RawMessage) error {
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	_, err := m.db.ExecContext(ctx,
		`INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, summary, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		actorID, action, entityType, entityID, summary, metadata,
	)
	return err
}
