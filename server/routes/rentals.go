package routes

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type FeatureHandler struct {
	db         *sql.DB
	operations *OperationsHandler
}

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

type featureCreateRequest struct {
	SectionKey  string          `json:"sectionKey"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Status      string          `json:"status"`
	Location    string          `json:"location"`
	Metadata    json.RawMessage `json:"metadata"`
}

var featureSections = map[string]map[string]bool{
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
	"spaces": {
		"events":   true,
		"bookings": true,
		"tickets":  true,
		"blogs":    true,
		"reports":  false,
	},
}

func NewFeatureHandler(db *sql.DB, operations *OperationsHandler) *FeatureHandler {
	return &FeatureHandler{db: db, operations: operations}
}

func (h *FeatureHandler) ListRentals(w http.ResponseWriter, r *http.Request) {
	h.listFeature(w, r, "rentals")
}

func (h *FeatureHandler) CreateRental(w http.ResponseWriter, r *http.Request) {
	h.createFeature(w, r, "rentals")
}

func (h *FeatureHandler) ListRentalModule(w http.ResponseWriter, r *http.Request) {
	h.listFeatureModule(w, r, "rentals")
}

func (h *FeatureHandler) CreateRentalModule(w http.ResponseWriter, r *http.Request) {
	h.createFeatureModule(w, r, "rentals")
}

func (h *FeatureHandler) listFeature(w http.ResponseWriter, r *http.Request, featureKey string) {
	sectionKey := strings.TrimSpace(r.URL.Query().Get("section"))

	query := `SELECT id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at
		FROM feature_items
		WHERE feature_key = $1`
	args := []any{featureKey}
	if sectionKey != "" {
		query += ` AND section_key = $2`
		args = append(args, sectionKey)
	}
	query += ` ORDER BY created_at DESC LIMIT 100`

	rows, err := h.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load feature items")
		return
	}
	defer rows.Close()

	items := []FeatureItem{}
	for rows.Next() {
		item := FeatureItem{}
		if err := rows.Scan(
			&item.ID,
			&item.FeatureKey,
			&item.SectionKey,
			&item.Title,
			&item.Description,
			&item.Status,
			&item.Location,
			&item.OwnerID,
			&item.Metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read feature items")
			return
		}
		items = append(items, item)
	}

	WriteJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *FeatureHandler) listFeatureModule(w http.ResponseWriter, r *http.Request, featureKey string) {
	sectionKey := strings.TrimSpace(r.PathValue("section"))
	if !isKnownFeatureSection(featureKey, sectionKey) {
		writeError(w, http.StatusNotFound, "Module not found")
		return
	}

	h.listFeatureBySection(w, r, featureKey, sectionKey)
}

func (h *FeatureHandler) listFeatureBySection(w http.ResponseWriter, r *http.Request, featureKey string, sectionKey string) {
	query := `SELECT id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at
		FROM feature_items
		WHERE feature_key = $1 AND section_key = $2
		ORDER BY created_at DESC LIMIT 100`

	rows, err := h.db.QueryContext(r.Context(), query, featureKey, sectionKey)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load feature items")
		return
	}
	defer rows.Close()

	items := []FeatureItem{}
	for rows.Next() {
		item := FeatureItem{}
		if err := rows.Scan(
			&item.ID,
			&item.FeatureKey,
			&item.SectionKey,
			&item.Title,
			&item.Description,
			&item.Status,
			&item.Location,
			&item.OwnerID,
			&item.Metadata,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Could not read feature items")
			return
		}
		items = append(items, item)
	}

	WriteJSON(w, http.StatusOK, map[string]any{
		"featureKey": featureKey,
		"sectionKey": sectionKey,
		"items":      items,
	})
}

func (h *FeatureHandler) createFeature(w http.ResponseWriter, r *http.Request, featureKey string) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	req, err := decodeFeatureCreateRequest(r, "active")
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.SectionKey == "" || req.Title == "" {
		writeError(w, http.StatusBadRequest, "sectionKey and title are required")
		return
	}

	item, err := h.insertFeatureItem(r, user.ID, featureKey, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create feature item")
		return
	}
	if err := h.recordFeatureStatusHistory(r, user.ID, item, "", item.Status); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not record item status")
		return
	}
	_ = h.createDefaultSLATask(r, user.ID, item)
	h.recordFeatureCreate(r, user, item, "feature.created")

	WriteJSON(w, http.StatusCreated, map[string]any{"item": item})
}

func (h *FeatureHandler) createFeatureModule(w http.ResponseWriter, r *http.Request, featureKey string) {
	sectionKey := strings.TrimSpace(r.PathValue("section"))
	if !isKnownFeatureSection(featureKey, sectionKey) {
		writeError(w, http.StatusNotFound, "Module not found")
		return
	}
	if !isWritableFeatureSection(featureKey, sectionKey) {
		writeError(w, http.StatusBadRequest, "This module does not accept submissions")
		return
	}

	h.createFeatureWithSection(w, r, featureKey, sectionKey)
}

func (h *FeatureHandler) createFeatureWithSection(w http.ResponseWriter, r *http.Request, featureKey string, sectionKey string) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	req, err := decodeFeatureCreateRequest(r, "submitted")
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	req.SectionKey = sectionKey

	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	item, err := h.insertFeatureItem(r, user.ID, featureKey, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create feature item")
		return
	}
	if err := h.recordFeatureStatusHistory(r, user.ID, item, "", item.Status); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not record item status")
		return
	}
	_ = h.createDefaultSLATask(r, user.ID, item)
	h.recordFeatureCreate(r, user, item, "feature.submitted")

	WriteJSON(w, http.StatusCreated, map[string]any{"item": item})
}

func (h *FeatureHandler) recordFeatureCreate(r *http.Request, user User, item FeatureItem, action string) {
	if h.operations == nil {
		return
	}

	metadata, _ := json.Marshal(map[string]string{
		"featureKey": item.FeatureKey,
		"sectionKey": item.SectionKey,
		"status":     item.Status,
	})
	_ = h.operations.RecordAudit(
		r,
		user.ID,
		action,
		"feature_item",
		IDString(item.ID),
		"Created "+item.SectionKey+" item: "+item.Title,
		metadata,
	)
	_ = h.operations.CreateNotification(
		r,
		nil,
		item.FeatureKey,
		"New "+item.SectionKey+" submission",
		item.Title+" was added to the workspace queue.",
		"request",
		metadata,
	)
}

func (h *FeatureHandler) recordFeatureStatusHistory(r *http.Request, actorID int64, item FeatureItem, fromStatus string, toStatus string) error {
	metadata, _ := json.Marshal(map[string]string{
		"title": item.Title,
	})
	_, err := h.db.ExecContext(
		r.Context(),
		`INSERT INTO feature_item_status_history
			(feature_item_id, feature_key, section_key, from_status, to_status, changed_by, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		item.ID,
		item.FeatureKey,
		item.SectionKey,
		fromStatus,
		toStatus,
		actorID,
		json.RawMessage(metadata),
	)
	return err
}

func (h *FeatureHandler) createDefaultSLATask(r *http.Request, ownerID int64, item FeatureItem) error {
	title := "Follow up " + item.Title
	description := "Review and move this " + item.SectionKey + " item to the next operational stage."
	dueAt := time.Now().UTC().Add(48 * time.Hour)
	metadata, _ := json.Marshal(map[string]string{
		"featureItemId": IDString(item.ID),
		"status":        item.Status,
	})

	_, err := h.db.ExecContext(
		r.Context(),
		`INSERT INTO sla_tasks
			(feature_key, section_key, feature_item_id, title, description, priority, owner_id, due_at, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		item.FeatureKey,
		item.SectionKey,
		item.ID,
		title,
		description,
		"normal",
		ownerID,
		dueAt,
		json.RawMessage(metadata),
	)
	return err
}

func decodeFeatureCreateRequest(r *http.Request, defaultStatus string) (featureCreateRequest, error) {
	req := featureCreateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return req, err
	}

	req.SectionKey = strings.TrimSpace(req.SectionKey)
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	req.Status = strings.TrimSpace(req.Status)
	req.Location = strings.TrimSpace(req.Location)
	if req.Status == "" {
		req.Status = defaultStatus
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}

	return req, nil
}

func (h *FeatureHandler) insertFeatureItem(r *http.Request, ownerID int64, featureKey string, req featureCreateRequest) (FeatureItem, error) {
	item := FeatureItem{}
	err := h.db.QueryRowContext(
		r.Context(),
		`INSERT INTO feature_items (feature_key, section_key, title, description, status, location, owner_id, metadata)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, feature_key, section_key, title, description, status, location, owner_id, metadata, created_at, updated_at`,
		featureKey,
		req.SectionKey,
		req.Title,
		req.Description,
		req.Status,
		req.Location,
		ownerID,
		req.Metadata,
	).Scan(
		&item.ID,
		&item.FeatureKey,
		&item.SectionKey,
		&item.Title,
		&item.Description,
		&item.Status,
		&item.Location,
		&item.OwnerID,
		&item.Metadata,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	return item, err
}

func isKnownFeatureSection(featureKey string, sectionKey string) bool {
	sections, ok := featureSections[featureKey]
	if !ok {
		return false
	}
	_, ok = sections[sectionKey]
	return ok
}

func isWritableFeatureSection(featureKey string, sectionKey string) bool {
	sections, ok := featureSections[featureKey]
	if !ok {
		return false
	}
	return sections[sectionKey]
}
