package routes

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"nafasi_new/back_nafasi/model"
	"nafasi_new/back_nafasi/service"
)

type OperationsHandler struct {
	service *service.Operations
}

func NewOperationsHandler(operations *service.Operations) *OperationsHandler {
	return &OperationsHandler{service: operations}
}

func (h *OperationsHandler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	items, err := h.service.ListNotifications(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load notifications")
		return
	}
	payload := make([]map[string]any, 0, len(items))
	for _, item := range items {
		payload = append(payload, notificationPayload(item))
	}
	WriteJSON(w, http.StatusOK, map[string]any{"notifications": payload})
}

func (h *OperationsHandler) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "Notification id is required")
		return
	}
	item, err := h.service.MarkNotificationRead(r.Context(), user.ID, id)
	if errors.Is(err, sql.ErrNoRows) {
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
	if err := h.service.MarkAllNotificationsRead(r.Context(), user.ID); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not update notifications")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]string{"message": "Notifications marked read"})
}

func (h *OperationsHandler) ListAuditLogs(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListAuditLogs(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load audit logs")
		return
	}
	payload := make([]map[string]any, 0, len(items))
	for _, item := range items {
		payload = append(payload, auditLogPayload(item))
	}
	WriteJSON(w, http.StatusOK, map[string]any{"auditLogs": payload})
}

func notificationPayload(item model.Notification) map[string]any {
	payload := map[string]any{
		"id": item.ID, "featureKey": item.FeatureKey, "title": item.Title,
		"body": item.Body, "kind": item.Kind, "metadata": item.Metadata,
		"createdAt": item.CreatedAt, "status": "unread",
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

func auditLogPayload(item model.AuditLog) map[string]any {
	payload := map[string]any{
		"id": item.ID, "action": item.Action, "entityType": item.EntityType,
		"entityId": item.EntityID, "summary": item.Summary,
		"metadata": item.Metadata, "createdAt": item.CreatedAt,
	}
	if item.ActorID.Valid {
		payload["actorId"] = item.ActorID.Int64
	}
	return payload
}
