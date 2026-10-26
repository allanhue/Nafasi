package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"nafasi_new/back_nafasi/model"
)

type CalendarError struct {
	Message string
}

func (e *CalendarError) Error() string {
	return e.Message
}

type Calendar struct {
	repository *model.Calendar
	operations *Operations
	mailer     *Mailer
}

func NewCalendar(repository *model.Calendar, operations *Operations, mailer *Mailer) *Calendar {
	return &Calendar{repository: repository, operations: operations, mailer: mailer}
}

func (s *Calendar) ListItems(ctx context.Context, userID int64) ([]model.CalendarItem, error) {
	return s.repository.ListItems(ctx, userID)
}

func (s *Calendar) CreateItem(ctx context.Context, userID int64, input model.CalendarItemInput) (model.CalendarItem, error) {
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	input.Location = strings.TrimSpace(input.Location)
	input.FeatureKey = strings.TrimSpace(input.FeatureKey)
	input.ItemType = strings.TrimSpace(input.ItemType)
	if input.FeatureKey == "" {
		input.FeatureKey = "account"
	}
	if input.ItemType == "" {
		input.ItemType = "reference"
	}
	if !validCalendarFeature(input.FeatureKey) {
		return model.CalendarItem{}, &CalendarError{Message: "Invalid calendar feature"}
	}
	if input.Title == "" || input.StartAt.IsZero() {
		return model.CalendarItem{}, &CalendarError{Message: "Title and start time are required"}
	}
	if len(input.Metadata) == 0 {
		input.Metadata = json.RawMessage(`{}`)
	}
	item, err := s.repository.CreateItem(ctx, userID, input)
	if err != nil {
		return item, err
	}
	if s.operations != nil {
		metadata, err := json.Marshal(map[string]string{"featureKey": item.FeatureKey, "itemType": item.ItemType})
		if err != nil {
			log.Printf("calendar metadata encoding failed item_id=%d: %v", item.ID, err)
		} else if err := s.operations.RecordAudit(ctx, userID, "calendar.item_created", "calendar_item",
			IDString(item.ID), "Created calendar item "+item.Title, metadata); err != nil {
			log.Printf("calendar item audit failed item_id=%d: %v", item.ID, err)
		}
	}
	return item, nil
}

func (s *Calendar) ListMaintenance(ctx context.Context) ([]model.MaintenanceWindow, error) {
	return s.repository.ListMaintenance(ctx)
}

func (s *Calendar) CreateMaintenance(ctx context.Context, actorID int64, input model.MaintenanceInput) (model.MaintenanceWindow, error) {
	input, err := normalizeMaintenanceInput(input, "scheduled")
	if err != nil {
		return model.MaintenanceWindow{}, err
	}
	item, err := s.repository.CreateMaintenance(ctx, actorID, input)
	if err != nil {
		return item, err
	}
	s.afterMaintenanceChange(ctx, actorID, item, "scheduled")
	return item, nil
}

func (s *Calendar) UpdateMaintenance(ctx context.Context, actorID, id int64, input model.MaintenanceInput) (model.MaintenanceWindow, error) {
	input, err := normalizeMaintenanceInput(input, "updated")
	if err != nil {
		return model.MaintenanceWindow{}, err
	}
	item, err := s.repository.UpdateMaintenance(ctx, id, input)
	if err != nil {
		return item, err
	}
	s.afterMaintenanceChange(ctx, actorID, item, "updated")
	return item, nil
}

func (s *Calendar) afterMaintenanceChange(ctx context.Context, actorID int64, item model.MaintenanceWindow, action string) {
	actionLabel := "Scheduled"
	if action == "updated" {
		actionLabel = "Updated"
	}
	if s.operations != nil {
		metadata, err := json.Marshal(map[string]string{"status": item.Status})
		if err != nil {
			log.Printf("maintenance metadata encoding failed item_id=%d: %v", item.ID, err)
		} else if err := s.operations.RecordAudit(ctx, actorID, "maintenance."+action, "maintenance_window",
			IDString(item.ID), actionLabel+" maintenance "+item.Title, metadata); err != nil {
			log.Printf("maintenance audit failed item_id=%d action=%s: %v", item.ID, action, err)
		}
	}
	recipients, err := s.repository.MaintenanceRecipients(ctx)
	if err != nil {
		log.Printf("maintenance recipient lookup failed: %v", err)
		return
	}
	body := fmt.Sprintf(
		"Nafasi maintenance %s: %s. Window: %s - %s. %s",
		action, item.Title, item.StartAt.Format(time.RFC1123), item.EndAt.Format(time.RFC1123), item.Description,
	)
	metadata, err := json.Marshal(map[string]any{
		"maintenanceId": item.ID, "status": item.Status, "startAt": item.StartAt, "endAt": item.EndAt,
	})
	if err != nil {
		log.Printf("maintenance notification metadata encoding failed item_id=%d: %v", item.ID, err)
		return
	}
	for _, recipient := range recipients {
		if s.operations != nil {
			if err := s.operations.CreateNotification(ctx, &recipient.ID, "system", item.Title, body, "maintenance", metadata); err != nil {
				log.Printf("maintenance notification failed user_id=%d: %v", recipient.ID, err)
			}
		}
		if s.mailer != nil {
			if err := s.mailer.Send(MailMessage{
				To:       []MailContact{{Email: recipient.Email, Name: recipient.Name}},
				Subject:  "Nafasi maintenance notice",
				TextBody: body,
			}); err != nil {
				log.Printf("maintenance email failed user_id=%d: %v", recipient.ID, err)
			}
		}
	}
}

func normalizeMaintenanceInput(input model.MaintenanceInput, defaultStatus string) (model.MaintenanceInput, error) {
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	input.Status = strings.TrimSpace(input.Status)
	if input.Status == "" {
		input.Status = defaultStatus
	}
	if input.Title == "" || input.StartAt.IsZero() || input.EndAt.IsZero() {
		return input, &CalendarError{Message: "Title, start time, and end time are required"}
	}
	if input.EndAt.Before(input.StartAt) {
		return input, &CalendarError{Message: "End time must be after start time"}
	}
	if !validMaintenanceStatus(input.Status) {
		return input, &CalendarError{Message: "Invalid maintenance status"}
	}
	if len(input.Metadata) == 0 {
		input.Metadata = json.RawMessage(`{}`)
	}
	return input, nil
}

func validCalendarFeature(value string) bool {
	switch value {
	case "rentals", "warehouses", "account":
		return true
	default:
		return false
	}
}

func validMaintenanceStatus(value string) bool {
	switch value {
	case "scheduled", "updated", "cancelled", "completed":
		return true
	default:
		return false
	}
}
