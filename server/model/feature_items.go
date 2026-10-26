package model

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

type FeatureItem struct {
	ID          int64           `json:"id"`
	FeatureKey  string          `json:"featureKey"`
	SectionKey  string          `json:"sectionKey"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Status      string          `json:"status"`
	Location    string          `json:"location"`
	OwnerID     sql.NullInt64   `json:"-"`
	Metadata    json.RawMessage `json:"metadata"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

type FeatureItemInput struct {
	SectionKey  string          `json:"sectionKey"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Status      string          `json:"status"`
	Location    string          `json:"location"`
	Metadata    json.RawMessage `json:"metadata"`
}

type FeatureActor struct {
	ID   int64
	Name string
	Role string
}

type FeatureCreation struct {
	FeatureKey      string
	Input           FeatureItemInput
	Actor           FeatureActor
	StatusMetadata  json.RawMessage
	TaskTitle       string
	TaskDescription string
	TaskDueAt       time.Time
	TaskMetadata    json.RawMessage
}

type FeatureItems struct {
	db *sql.DB
}

func NewFeatureItems(db *sql.DB) *FeatureItems {
	return &FeatureItems{db: db}
}

func (m *FeatureItems) List(ctx context.Context, featureKey, sectionKey string) ([]FeatureItem, error) {
	query := `SELECT id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at
		FROM feature_items WHERE feature_key = $1`
	args := []any{featureKey}
	if sectionKey != "" {
		query += ` AND section_key = $2`
		args = append(args, sectionKey)
	}
	query += ` ORDER BY created_at DESC LIMIT 100`
	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFeatureItems(rows)
}

func (m *FeatureItems) ListSection(ctx context.Context, featureKey, sectionKey string) ([]FeatureItem, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at
		 FROM feature_items WHERE feature_key = $1 AND section_key = $2
		 ORDER BY created_at DESC LIMIT 100`,
		featureKey, sectionKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFeatureItems(rows)
}

func (m *FeatureItems) Create(ctx context.Context, creation FeatureCreation) (FeatureItem, error) {
	input, actor, featureKey := creation.Input, creation.Actor, creation.FeatureKey
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return FeatureItem{}, err
	}
	defer tx.Rollback()

	item := FeatureItem{}
	err = tx.QueryRowContext(ctx,
		`INSERT INTO feature_items (feature_key, section_key, title, description, status, location, owner_id, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at`,
		featureKey, input.SectionKey, input.Title, input.Description, input.Status,
		input.Location, actor.ID, input.Metadata,
	).Scan(&item.ID, &item.FeatureKey, &item.SectionKey, &item.Title, &item.Description,
		&item.Status, &item.Location, &item.OwnerID, &item.Metadata, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return FeatureItem{}, err
	}

	_, err = tx.ExecContext(ctx,
		`INSERT INTO feature_item_status_history
			(feature_item_id, feature_key, section_key, from_status, to_status, changed_by, metadata)
		 VALUES ($1, $2, $3, '', $4, $5, $6)`,
		item.ID, item.FeatureKey, item.SectionKey, item.Status, actor.ID, creation.StatusMetadata,
	)
	if err != nil {
		return FeatureItem{}, err
	}

	_, err = tx.ExecContext(ctx,
		`INSERT INTO sla_tasks
			(feature_key, section_key, feature_item_id, title, description, priority, owner_id, due_at, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb || jsonb_build_object('featureItemId', $3::text))`,
		item.FeatureKey, item.SectionKey, item.ID, creation.TaskTitle,
		creation.TaskDescription, "normal", actor.ID, creation.TaskDueAt, creation.TaskMetadata,
	)
	if err != nil {
		return FeatureItem{}, err
	}
	if err := tx.Commit(); err != nil {
		return FeatureItem{}, err
	}
	return item, nil
}

func scanFeatureItems(rows *sql.Rows) ([]FeatureItem, error) {
	items := []FeatureItem{}
	for rows.Next() {
		item := FeatureItem{}
		if err := rows.Scan(&item.ID, &item.FeatureKey, &item.SectionKey, &item.Title,
			&item.Description, &item.Status, &item.Location, &item.OwnerID, &item.Metadata,
			&item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
