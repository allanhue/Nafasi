package routes

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"nafasi_new/back_nafasi/model"
	"nafasi_new/back_nafasi/service"
)

type CalendarHandler struct {
	calendar *service.Calendar
}

func NewCalendarHandler(calendar *service.Calendar) *CalendarHandler {
	return &CalendarHandler{calendar: calendar}
}

func (h *CalendarHandler) ListCalendarItems(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	items, err := h.calendar.ListItems(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load calendar")
		return
	}
	payload := make([]map[string]any, 0, len(items))
	for _, item := range items {
		payload = append(payload, calendarItemPayload(item))
	}
	WriteJSON(w, http.StatusOK, map[string]any{"items": payload})
}

func (h *CalendarHandler) CreateCalendarItem(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input model.CalendarItemInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	item, err := h.calendar.CreateItem(r.Context(), user.ID, input)
	if err != nil {
		var modelValidationError *service.CalendarError
		if errors.As(err, &modelValidationError) {
			writeError(w, http.StatusBadRequest, modelValidationError.Message)
			return
		}
		if isCalendarValidationMessage(err) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not create calendar item")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]any{"item": calendarItemPayload(item)})
}

func (h *CalendarHandler) ListMaintenance(w http.ResponseWriter, r *http.Request) {
	items, err := h.calendar.ListMaintenance(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load maintenance")
		return
	}
	payload := make([]map[string]any, 0, len(items))
	for _, item := range items {
		payload = append(payload, maintenancePayload(item))
	}
	WriteJSON(w, http.StatusOK, map[string]any{"maintenance": payload})
}

func (h *CalendarHandler) CreateMaintenance(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var input model.MaintenanceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	item, err := h.calendar.CreateMaintenance(r.Context(), user.ID, input)
	if err != nil {
		if isCalendarValidationMessage(err) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not schedule maintenance")
		return
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
	var input model.MaintenanceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	item, err := h.calendar.UpdateMaintenance(r.Context(), user.ID, id, input)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Maintenance window not found")
		return
	}
	if err != nil {
		if isCalendarValidationMessage(err) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not update maintenance")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"maintenance": maintenancePayload(item)})
}

func calendarItemPayload(item model.CalendarItem) map[string]any {
	payload := map[string]any{
		"id": item.ID, "userId": item.UserID, "featureKey": item.FeatureKey,
		"itemType": item.ItemType, "title": item.Title, "description": item.Description,
		"location": item.Location, "startAt": item.StartAt, "metadata": item.Metadata,
		"createdAt": item.CreatedAt, "updatedAt": item.UpdatedAt,
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

func maintenancePayload(item model.MaintenanceWindow) map[string]any {
	payload := map[string]any{
		"id": item.ID, "title": item.Title, "description": item.Description,
		"startAt": item.StartAt, "endAt": item.EndAt, "status": item.Status,
		"metadata": item.Metadata, "createdAt": item.CreatedAt, "updatedAt": item.UpdatedAt,
	}
	if item.CreatedBy.Valid {
		payload["createdBy"] = item.CreatedBy.Int64
	}
	return payload
}

func isCalendarValidationMessage(err error) bool {
	var validationError *service.CalendarError
	return errors.As(err, &validationError)
}
