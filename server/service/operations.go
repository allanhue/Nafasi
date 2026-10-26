package service

import (
	"context"
	"encoding/json"

	"nafasi_new/back_nafasi/model"
)

type Operations struct {
	repository *model.Operations
}

func NewOperations(repository *model.Operations) *Operations {
	return &Operations{repository: repository}
}

func (s *Operations) ListNotifications(ctx context.Context, userID int64) ([]model.Notification, error) {
	return s.repository.ListNotifications(ctx, userID)
}

func (s *Operations) MarkNotificationRead(ctx context.Context, userID, notificationID int64) (model.Notification, error) {
	return s.repository.MarkNotificationRead(ctx, userID, notificationID)
}

func (s *Operations) MarkAllNotificationsRead(ctx context.Context, userID int64) error {
	return s.repository.MarkAllNotificationsRead(ctx, userID)
}

func (s *Operations) ListAuditLogs(ctx context.Context) ([]model.AuditLog, error) {
	return s.repository.ListAuditLogs(ctx)
}

func (s *Operations) CreateNotification(ctx context.Context, userID *int64, featureKey, title, body, kind string, metadata json.RawMessage) error {
	return s.repository.CreateNotification(ctx, userID, featureKey, title, body, kind, metadata)
}

func (s *Operations) RecordAudit(ctx context.Context, actorID int64, action, entityType, entityID, summary string, metadata json.RawMessage) error {
	return s.repository.RecordAudit(ctx, actorID, action, entityType, entityID, summary, metadata)
}
