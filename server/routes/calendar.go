package routes

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type CalendarHandler struct {
	db         *sql.DB
	operations *OperationsHandler
	mailer     *Mailer
}

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

func NewCalendarHandler(db *sql.DB, operations *OperationsHandler, mailer *Mailer) *CalendarHandler {
	return &CalendarHandler{db: db, operations: operations, mailer: mailer}
}

func (h *CalendarHandler) ListCalendarItems(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	rows, err := h.db.QueryContext(
		r.Context(),
		`SELECT id, user_id, feature_key, item_type, title, description, location, start_at, end_at,
			reminder_at, related_feature_item_id, metadata, created_at, updated_at
		 FROM calendar_items
		 WHERE user_id = $1
		 ORDER BY start_at ASC
		 LIMIT 200`,
		user.ID,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load calendar")
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		item := CalendarItem{}
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.FeatureKey,
			&item.ItemType,
			&item.Title,
			&item.Description,
			&item.Location,
			&item.StartAt,
			&item.EndAt,
			&item.ReminderAt,
			&item.RelatedFeatureItemID,
			&item.Metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read calendar")
			return
		}
		items = append(items, calendarItemPayload(item))
	}

	WriteJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *CalendarHandler) CreateCalendarItem(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	req, err := decodeCalendarItemRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	item := CalendarItem{}
	err = h.db.QueryRowContext(
		r.Context(),
		`INSERT INTO calendar_items
			(user_id, feature_key, item_type, title, description, location, start_at, end_at, reminder_at, related_feature_item_id, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING id, user_id, feature_key, item_type, title, description, location, start_at, end_at,
			reminder_at, related_feature_item_id, metadata, created_at, updated_at`,
		user.ID,
		req.FeatureKey,
		req.ItemType,
		req.Title,
		req.Description,
		req.Location,
		req.StartAt,
		req.EndAt,
		req.ReminderAt,
		req.RelatedFeatureItemID,
		req.Metadata,
	).Scan(
		&item.ID,
		&item.UserID,
		&item.FeatureKey,
		&item.ItemType,
		&item.Title,
		&item.Description,
		&item.Location,
		&item.StartAt,
		&item.EndAt,
		&item.ReminderAt,
		&item.RelatedFeatureItemID,
		&item.Metadata,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create calendar item")
		return
	}

	if h.operations != nil {
		metadata, _ := json.Marshal(map[string]string{
			"featureKey": item.FeatureKey,
			"itemType":   item.ItemType,
		})
		_ = h.operations.RecordAudit(r, user.ID, "calendar.item_created", "calendar_item", IDString(item.ID), "Created calendar item "+item.Title, metadata)
	}

	WriteJSON(w, http.StatusCreated, map[string]any{"item": calendarItemPayload(item)})
}

func (h *CalendarHandler) ListMaintenance(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.QueryContext(
		r.Context(),
		`SELECT id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at
		 FROM maintenance_windows
		 ORDER BY start_at DESC
		 LIMIT 100`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load maintenance")
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		item := MaintenanceWindow{}
		if err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.Description,
			&item.StartAt,
			&item.EndAt,
			&item.Status,
			&item.CreatedBy,
			&item.Metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read maintenance")
			return
		}
		items = append(items, maintenancePayload(item))
	}

	WriteJSON(w, http.StatusOK, map[string]any{"maintenance": items})
}

func (h *CalendarHandler) CreateMaintenance(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	req, err := decodeMaintenanceRequest(r, "scheduled")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	item := MaintenanceWindow{}
	err = h.db.QueryRowContext(
		r.Context(),
		`INSERT INTO maintenance_windows (title, description, start_at, end_at, status, created_by, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at`,
		req.Title,
		req.Description,
		req.StartAt,
		req.EndAt,
		req.Status,
		user.ID,
		req.Metadata,
	).Scan(
		&item.ID,
		&item.Title,
		&item.Description,
		&item.StartAt,
		&item.EndAt,
		&item.Status,
		&item.CreatedBy,
		&item.Metadata,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not schedule maintenance")
		return
	}

	h.notifyCustomersAboutMaintenance(r, item, "scheduled")
	if h.operations != nil {
		metadata, _ := json.Marshal(map[string]string{"status": item.Status})
		_ = h.operations.RecordAudit(r, user.ID, "maintenance.scheduled", "maintenance_window", IDString(item.ID), "Scheduled maintenance "+item.Title, metadata)
	}

	WriteJSON(w, http.StatusCreated, map[string]any{"maintenance": maintenancePayload(item)})
}

func (h *CalendarHandler) UpdateMaintenance(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	id, err := strconv.ParseInt(strings.TrimSpace(r.PathValue("id")), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "Valid maintenance id is required")
		return
	}

	req, err := decodeMaintenanceRequest(r, "updated")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	item := MaintenanceWindow{}
	err = h.db.QueryRowContext(
		r.Context(),
		`UPDATE maintenance_windows
		 SET title = $1, description = $2, start_at = $3, end_at = $4, status = $5, metadata = $6, updated_at = NOW()
		 WHERE id = $7
		 RETURNING id, title, description, start_at, end_at, status, created_by, metadata, created_at, updated_at`,
		req.Title,
		req.Description,
		req.StartAt,
		req.EndAt,
		req.Status,
		req.Metadata,
		id,
	).Scan(
		&item.ID,
		&item.Title,
		&item.Description,
		&item.StartAt,
		&item.EndAt,
		&item.Status,
		&item.CreatedBy,
		&item.Metadata,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Maintenance window not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update maintenance")
		return
	}

	h.notifyCustomersAboutMaintenance(r, item, "updated")
	if h.operations != nil {
		metadata, _ := json.Marshal(map[string]string{"status": item.Status})
		_ = h.operations.RecordAudit(r, user.ID, "maintenance.updated", "maintenance_window", IDString(item.ID), "Updated maintenance "+item.Title, metadata)
	}

	WriteJSON(w, http.StatusOK, map[string]any{"maintenance": maintenancePayload(item)})
}

func (h *CalendarHandler) notifyCustomersAboutMaintenance(r *http.Request, item MaintenanceWindow, action string) {
	rows, err := h.db.QueryContext(r.Context(), `SELECT id, name, email FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT 1000`)
	if err != nil {
		return
	}
	defer rows.Close()

	body := fmt.Sprintf(
		"Nafasi maintenance %s: %s. Window: %s - %s. %s",
		action,
		item.Title,
		item.StartAt.Format(time.RFC1123),
		item.EndAt.Format(time.RFC1123),
		item.Description,
	)
	metadata, _ := json.Marshal(map[string]any{
		"maintenanceId": item.ID,
		"status":        item.Status,
		"startAt":       item.StartAt,
		"endAt":         item.EndAt,
	})

	for rows.Next() {
		var id int64
		var name string
		var email string
		if err := rows.Scan(&id, &name, &email); err != nil {
			continue
		}
		if h.operations != nil {
			_ = h.operations.CreateNotification(r, &id, "system", item.Title, body, "maintenance", metadata)
		}
		if h.mailer != nil {
			_ = h.mailer.Send(MailMessage{
				To:       []MailContact{{Email: email, Name: name}},
				Subject:  "Nafasi maintenance notice",
				TextBody: body,
			})
		}
	}
}

type calendarItemRequest struct {
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

type maintenanceRequest struct {
	Description string          `json:"description"`
	EndAt       time.Time       `json:"endAt"`
	Metadata    json.RawMessage `json:"metadata"`
	StartAt     time.Time       `json:"startAt"`
	Status      string          `json:"status"`
	Title       string          `json:"title"`
}

func decodeCalendarItemRequest(r *http.Request) (calendarItemRequest, error) {
	req := calendarItemRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return req, errors.New("Invalid request body")
	}
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	req.Location = strings.TrimSpace(req.Location)
	req.FeatureKey = strings.TrimSpace(req.FeatureKey)
	req.ItemType = strings.TrimSpace(req.ItemType)
	if req.FeatureKey == "" {
		req.FeatureKey = "account"
	}
	if req.ItemType == "" {
		req.ItemType = "reference"
	}
	if !isCalendarFeature(req.FeatureKey) {
		return req, errors.New("Invalid calendar feature")
	}
	if req.Title == "" || req.StartAt.IsZero() {
		return req, errors.New("Title and start time are required")
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	return req, nil
}

func decodeMaintenanceRequest(r *http.Request, defaultStatus string) (maintenanceRequest, error) {
	req := maintenanceRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return req, errors.New("Invalid request body")
	}
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	req.Status = strings.TrimSpace(req.Status)
	if req.Status == "" {
		req.Status = defaultStatus
	}
	if req.Title == "" || req.StartAt.IsZero() || req.EndAt.IsZero() {
		return req, errors.New("Title, start time, and end time are required")
	}
	if req.EndAt.Before(req.StartAt) {
		return req, errors.New("End time must be after start time")
	}
	if !isMaintenanceStatus(req.Status) {
		return req, errors.New("Invalid maintenance status")
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	return req, nil
}

func calendarItemPayload(item CalendarItem) map[string]any {
	payload := map[string]any{
		"id":          item.ID,
		"userId":      item.UserID,
		"featureKey":  item.FeatureKey,
		"itemType":    item.ItemType,
		"title":       item.Title,
		"description": item.Description,
		"location":    item.Location,
		"startAt":     item.StartAt,
		"metadata":    item.Metadata,
		"createdAt":   item.CreatedAt,
		"updatedAt":   item.UpdatedAt,
	}
	if item.EndAt.Valid {
		payload["endAt"] = item.EndAt.Time
	}
	if item.ReminderAt.Valid {
		payload["reminderAt"] = item.ReminderAt.Time
	}
	if item.RelatedFeatureItemID.Valid {
		payload["relatedFeatureItemId"] = item.RelatedFeatureItemID.Int64
	}
	return payload
}

func maintenancePayload(item MaintenanceWindow) map[string]any {
	payload := map[string]any{
		"id":          item.ID,
		"title":       item.Title,
		"description": item.Description,
		"startAt":     item.StartAt,
		"endAt":       item.EndAt,
		"status":      item.Status,
		"metadata":    item.Metadata,
		"createdAt":   item.CreatedAt,
		"updatedAt":   item.UpdatedAt,
	}
	if item.CreatedBy.Valid {
		payload["createdBy"] = item.CreatedBy.Int64
	}
	return payload
}

func isCalendarFeature(value string) bool {
	switch value {
	case "rentals", "warehouses", "spaces", "account":
		return true
	default:
		return false
	}
}

func isMaintenanceStatus(value string) bool {
	switch value {
	case "scheduled", "updated", "cancelled", "completed":
		return true
	default:
		return false
	}
}
