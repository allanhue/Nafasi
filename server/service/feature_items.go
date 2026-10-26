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

var writableFeatureSections = map[string]map[string]bool{
	"rentals": {
		"property-listings": true,
		"viewing-requests":  true,
		"applications":      true,
		"leases":            true,
		"reports":           false,
	},
	"warehouses": {
		"storage-requests":   true,
		"warehouse-listings": true,
		"logistics-support":  true,
		"contracts":          true,
		"reports":            false,
	},
}

type FeatureItems struct {
	repository *model.FeatureItems
	operations *Operations
}

func NewFeatureItems(repository *model.FeatureItems, operations *Operations) *FeatureItems {
	return &FeatureItems{repository: repository, operations: operations}
}

func knownFeatureSection(featureKey, sectionKey string) bool {
	_, ok := writableFeatureSections[featureKey][sectionKey]
	return ok
}

func writableFeatureSection(featureKey, sectionKey string) bool {
	return writableFeatureSections[featureKey][sectionKey]
}

func (s *FeatureItems) List(ctx context.Context, featureKey, sectionKey string) ([]model.FeatureItem, error) {
	return s.repository.List(ctx, featureKey, sectionKey)
}

func (s *FeatureItems) ListSection(ctx context.Context, featureKey, sectionKey string) ([]model.FeatureItem, error) {
	if !knownFeatureSection(featureKey, sectionKey) {
		return nil, &FeatureError{Kind: "not_found", Message: "Module not found"}
	}
	return s.repository.ListSection(ctx, featureKey, sectionKey)
}

func (s *FeatureItems) Create(ctx context.Context, actor model.FeatureActor, featureKey string, input model.FeatureItemInput, moduleSubmission bool) (model.FeatureItem, error) {
	input.SectionKey = strings.TrimSpace(input.SectionKey)
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	input.Status = strings.TrimSpace(input.Status)
	input.Location = strings.TrimSpace(input.Location)
	if moduleSubmission {
		if !knownFeatureSection(featureKey, input.SectionKey) {
			return model.FeatureItem{}, &FeatureError{Kind: "not_found", Message: "Module not found"}
		}
		if !writableFeatureSection(featureKey, input.SectionKey) {
			return model.FeatureItem{}, &FeatureError{Kind: "validation", Message: "This module does not accept submissions"}
		}
	}
	if input.SectionKey == "" || input.Title == "" {
		return model.FeatureItem{}, &FeatureError{Kind: "validation", Message: "sectionKey and title are required"}
	}
	action := "feature.created"
	if input.Status == "" {
		input.Status = "active"
		if moduleSubmission {
			input.Status = "submitted"
		}
	}
	if moduleSubmission {
		action = "feature.submitted"
	}
	if len(input.Metadata) == 0 {
		input.Metadata = json.RawMessage(`{}`)
	}
	statusMetadata, err := json.Marshal(map[string]string{"title": input.Title})
	if err != nil {
		return model.FeatureItem{}, fmt.Errorf("encode feature status metadata: %w", err)
	}
	taskMetadata, err := json.Marshal(map[string]string{
		"status": input.Status,
	})
	if err != nil {
		return model.FeatureItem{}, fmt.Errorf("encode follow-up metadata: %w", err)
	}
	item, err := s.repository.Create(ctx, model.FeatureCreation{
		FeatureKey: featureKey, Input: input, Actor: actor,
		StatusMetadata:  statusMetadata,
		TaskTitle:       "Follow up " + input.Title,
		TaskDescription: "Review and move this " + input.SectionKey + " item to the next operational stage.",
		TaskDueAt:       time.Now().UTC().Add(48 * time.Hour),
		TaskMetadata:    taskMetadata,
	})
	if err != nil {
		return model.FeatureItem{}, err
	}
	s.recordFeatureCreate(ctx, actor.ID, item, action)
	return item, nil
}

type FeatureError struct {
	Kind    string
	Message string
}

func (e *FeatureError) Error() string {
	return e.Message
}

func (s *FeatureItems) recordFeatureCreate(ctx context.Context, actorID int64, item model.FeatureItem, action string) {
	if s.operations == nil {
		return
	}
	metadata, err := json.Marshal(map[string]string{
		"featureKey": item.FeatureKey, "sectionKey": item.SectionKey, "status": item.Status,
	})
	if err != nil {
		log.Printf("feature metadata encoding failed item_id=%d: %v", item.ID, err)
		return
	}
	if err := s.operations.RecordAudit(ctx, actorID, action, "feature_item", IDString(item.ID),
		"Created "+item.SectionKey+" item: "+item.Title, metadata); err != nil {
		log.Printf("feature audit failed item_id=%d action=%s: %v", item.ID, action, err)
	}
	if err := s.operations.CreateNotification(ctx, nil, item.FeatureKey, "New "+item.SectionKey+" submission",
		item.Title+" was added to the workspace queue.", "request", metadata); err != nil {
		log.Printf("feature notification failed item_id=%d: %v", item.ID, err)
	}
}

func IDString(id int64) string {
	return fmt.Sprint(id)
}
