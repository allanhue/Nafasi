package routes

import (
	"context"
	"database/sql"
	"net/http"
	"time"
)

type NotificationService struct {
	db *sql.DB
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{db: db}
}

type Notification struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Type      string `json:"type"`
	Read      bool   `json:"read"`
	CreatedAt string `json:"created_at"`
}

func (s *NotificationService) HandleGetNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		respondError(w, http.StatusUnauthorized, "user id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, user_id, title, message, type, read, created_at 
		FROM notifications 
		WHERE user_id = $1 
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch notifications")
		return
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.Read, &n.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		notifications = append(notifications, n)
	}

	respondJSON(w, http.StatusOK, notifications)
}

func (s *NotificationService) HandleMarkAsRead(w http.ResponseWriter, r *http.Request) {
	notificationID := r.URL.Query().Get("id")
	if notificationID == "" {
		respondError(w, http.StatusBadRequest, "notification id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err := s.db.ExecContext(ctx, `
		UPDATE notifications SET read = true WHERE id = $1
	`, notificationID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update notification")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "marked as read"})
}
