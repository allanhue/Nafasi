package routes

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type OperationsHandler struct {
	db *sql.DB
}

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

func NewOperationsHandler(db *sql.DB) *OperationsHandler {
	return &OperationsHandler{db: db}
}

func (h *OperationsHandler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	rows, err := h.db.QueryContext(
		r.Context(),
		`SELECT id, user_id, feature_key, title, body, kind, read_at, metadata, created_at
		 FROM notifications
		 WHERE user_id = $1 OR user_id IS NULL
		 ORDER BY created_at DESC
		 LIMIT 50`,
		user.ID,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load notifications")
		return
	}
	defer rows.Close()

	notifications := []map[string]any{}
	for rows.Next() {
		item := Notification{}
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.FeatureKey,
			&item.Title,
			&item.Body,
			&item.Kind,
			&item.ReadAt,
			&item.Metadata,
			&item.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read notifications")
			return
		}
		notifications = append(notifications, notificationPayload(item))
	}

	WriteJSON(w, http.StatusOK, map[string]any{"notifications": notifications})
}

func (h *OperationsHandler) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	notificationID := r.PathValue("id")
	if notificationID == "" {
		writeError(w, http.StatusBadRequest, "Notification id is required")
		return
	}

	item := Notification{}
	err := h.db.QueryRowContext(
		r.Context(),
		`UPDATE notifications
		 SET read_at = NOW()
		 WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
		 RETURNING id, user_id, feature_key, title, body, kind, read_at, metadata, created_at`,
		notificationID,
		user.ID,
	).Scan(
		&item.ID,
		&item.UserID,
		&item.FeatureKey,
		&item.Title,
		&item.Body,
		&item.Kind,
		&item.ReadAt,
		&item.Metadata,
		&item.CreatedAt,
	)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "Notification not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update notification")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{"notification": notificationPayload(item)})
}

func (h *OperationsHandler) MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	if _, err := h.db.ExecContext(
		r.Context(),
		`UPDATE notifications
		 SET read_at = COALESCE(read_at, NOW())
		 WHERE user_id = $1 OR user_id IS NULL`,
		user.ID,
	); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update notifications")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]string{"message": "Notifications marked read"})
}

func (h *OperationsHandler) ListAuditLogs(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.QueryContext(
		r.Context(),
		`SELECT id, actor_id, action, entity_type, entity_id, summary, metadata, created_at
		 FROM audit_logs
		 ORDER BY created_at DESC
		 LIMIT 100`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load audit logs")
		return
	}
	defer rows.Close()

	logs := []map[string]any{}
	for rows.Next() {
		item := AuditLog{}
		if err := rows.Scan(
			&item.ID,
			&item.ActorID,
			&item.Action,
			&item.EntityType,
			&item.EntityID,
			&item.Summary,
			&item.Metadata,
			&item.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read audit logs")
			return
		}
		logs = append(logs, auditLogPayload(item))
	}

	WriteJSON(w, http.StatusOK, map[string]any{"auditLogs": logs})
}

func (h *OperationsHandler) CreateNotification(r *http.Request, userID *int64, featureKey string, title string, body string, kind string, metadata json.RawMessage) error {
	var nullableUserID any
	if userID != nil {
		nullableUserID = *userID
	}
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}

	_, err := h.db.ExecContext(
		r.Context(),
		`INSERT INTO notifications (user_id, feature_key, title, body, kind, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		nullableUserID,
		featureKey,
		title,
		body,
		kind,
		metadata,
	)
	return err
}

func (h *OperationsHandler) RecordAudit(r *http.Request, actorID int64, action string, entityType string, entityID string, summary string, metadata json.RawMessage) error {
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}

	_, err := h.db.ExecContext(
		r.Context(),
		`INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, summary, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		actorID,
		action,
		entityType,
		entityID,
		summary,
		metadata,
	)
	return err
}

func notificationPayload(item Notification) map[string]any {
	payload := map[string]any{
		"id":         item.ID,
		"featureKey": item.FeatureKey,
		"title":      item.Title,
		"body":       item.Body,
		"kind":       item.Kind,
		"metadata":   item.Metadata,
		"createdAt":  item.CreatedAt,
		"status":     "unread",
	}
	if item.UserID.Valid {
		payload["userId"] = item.UserID.Int64
	}
	if item.ReadAt.Valid {
		payload["readAt"] = item.ReadAt.Time
		payload["status"] = "read"
	}
	return payload
}

func auditLogPayload(item AuditLog) map[string]any {
	payload := map[string]any{
		"id":         item.ID,
		"action":     item.Action,
		"entityType": item.EntityType,
		"entityId":   item.EntityID,
		"summary":    item.Summary,
		"metadata":   item.Metadata,
		"createdAt":  item.CreatedAt,
	}
	if item.ActorID.Valid {
		payload["actorId"] = item.ActorID.Int64
	}
	return payload
}

func IDString(id int64) string {
	return strconv.FormatInt(id, 10)
}
