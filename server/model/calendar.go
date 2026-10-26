package model

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

type CalendarItem struct {
	ID                   int64           `json:"id"`
	UserID               int64           `json:"userId"`
	FeatureKey           string          `json:"featureKey"`
	ItemType             string          `json:"itemType"`
	Title                string          `json:"title"`
	Description          string          `json:"description"`
	Location             string          `json:"location"`
	StartAt              time.Time       `json:"startAt"`
	EndAt                sql.NullTime    `json:"-"`
	ReminderAt           sql.NullTime    `json:"-"`
	RelatedFeatureItemID sql.NullInt64   `json:"-"`
	Metadata             json.RawMessage `json:"metadata"`
	CreatedAt            time.Time       `json:"createdAt"`
	UpdatedAt            time.Time       `json:"updatedAt"`
}

type MaintenanceWindow struct {
	ID          int64           `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	StartAt     time.Time       `json:"startAt"`
	EndAt       time.Time       `json:"endAt"`
	Status      string          `json:"status"`
	CreatedBy   sql.NullInt64   `json:"-"`
	Metadata    json.RawMessage `json:"metadata"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

type CalendarItemInput struct {
	Description          string          `json:"description"`
	EndAt                *time.Time      `json:"endAt"`
	FeatureKey           string          `json:"featureKey"`
	ItemType             string          `json:"itemType"`
	Location             string          `json:"location"`
	Metadata             json.RawMessage `json:"metadata"`
	RelatedFeatureItemID *int64          `json:"relatedFeatureItemId"`
	ReminderAt           *time.Time      `json:"reminderAt"`
	StartAt              time.Time       `json:"startAt"`
	Title                string          `json:"title"`
}

type MaintenanceInput struct {
	Description string          `json:"description"`
	EndAt       time.Time       `json:"endAt"`
	Metadata    json.RawMessage `json:"metadata"`
	StartAt     time.Time       `json:"startAt"`
	Status      string          `json:"status"`
	Title       string          `json:"title"`
}

type MaintenanceRecipient struct {
	ID    int64
	Name  string
	Email string
}

type Calendar struct {
	db *sql.DB
}

func NewCalendar(db *sql.DB) *Calendar {
	return &Calendar{db: db}
}

func (m *Calendar) ListItems(ctx context.Context, userID int64) ([]CalendarItem, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, user_id, feature_key, item_type, title, description, location, start_at, end_at,
		 reminder_at, related_feature_item_id, metadata, created_at, updated_at
		 FROM calendar_items WHERE user_id = $1 ORDER BY start_at ASC LIMIT 200`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []CalendarItem{}
	for rows.Next() {
		var item CalendarItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.FeatureKey, &item.ItemType, &item.Title,
			&item.Description, &item.Location, &item.StartAt, &item.EndAt, &item.ReminderAt,
			&item.RelatedFeatureItemID, &item.Metadata, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (m *Calendar) CreateItem(ctx context.Context, userID int64, input CalendarItemInput) (CalendarItem, error) {
	var endAt, reminderAt any
	var relatedItemID any
	if input.EndAt != nil {
		endAt = *input.EndAt
	}
	if input.ReminderAt != nil {
		reminderAt = *input.ReminderAt
	}
	if input.RelatedFeatureItemID != nil {
		relatedItemID = *input.RelatedFeatureItemID
	}
	item := CalendarItem{}
	err := m.db.QueryRowContext(ctx,
		`INSERT INTO calendar_items
		 (user_id, feature_key, item_type, title, description, location, start_at, end_at, reminder_at, related_feature_item_id, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING id, user_id, feature_key, item_type, title, description, location, start_at, end_at,
		 reminder_at, related_feature_item_id, metadata, created_at, updated_at`,
		userID, input.FeatureKey, input.ItemType, input.Title, input.Description, input.Location,
		input.StartAt, endAt, reminderAt, relatedItemID, input.Metadata,
	).Scan(&item.ID, &item.UserID, &item.FeatureKey, &item.ItemType, &item.Title, &item.Description,
		&item.Location, &item.StartAt, &item.EndAt, &item.ReminderAt, &item.RelatedFeatureItemID,
		&item.Metadata, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (m *Calendar) ListMaintenance(ctx context.Context) ([]MaintenanceWindow, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at
		 FROM maintenance_windows ORDER BY start_at DESC LIMIT 100`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []MaintenanceWindow{}
	for rows.Next() {
		var item MaintenanceWindow
		if err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.StartAt, &item.EndAt,
			&item.Status, &item.CreatedBy, &item.Metadata, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (m *Calendar) CreateMaintenance(ctx context.Context, actorID int64, input MaintenanceInput) (MaintenanceWindow, error) {
	item := MaintenanceWindow{}
	err := m.db.QueryRowContext(ctx,
		`INSERT INTO maintenance_windows (title, description, start_at, end_at, status, created_by, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at`,
		input.Title, input.Description, input.StartAt, input.EndAt, input.Status, actorID, input.Metadata,
	).Scan(&item.ID, &item.Title, &item.Description, &item.StartAt, &item.EndAt, &item.Status,
		&item.CreatedBy, &item.Metadata, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (m *Calendar) UpdateMaintenance(ctx context.Context, id int64, input MaintenanceInput) (MaintenanceWindow, error) {
	item := MaintenanceWindow{}
	err := m.db.QueryRowContext(ctx,
		`UPDATE maintenance_windows
		 SET title = $1, description = $2, start_at = $3, end_at = $4, status = $5, metadata = $6, updated_at = NOW()
		 WHERE id = $7
		 RETURNING id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at`,
		input.Title, input.Description, input.StartAt, input.EndAt, input.Status, input.Metadata, id,
	).Scan(&item.ID, &item.Title, &item.Description, &item.StartAt, &item.EndAt, &item.Status,
		&item.CreatedBy, &item.Metadata, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (m *Calendar) MaintenanceRecipients(ctx context.Context) ([]MaintenanceRecipient, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, name, email FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT 1000`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	recipients := []MaintenanceRecipient{}
	for rows.Next() {
		var item MaintenanceRecipient
		if err := rows.Scan(&item.ID, &item.Name, &item.Email); err != nil {
			return nil, err
		}
		recipients = append(recipients, item)
	}
	return recipients, rows.Err()
}
