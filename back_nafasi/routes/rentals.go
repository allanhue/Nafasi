package routes

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type FeatureHandler struct {
	db *sql.DB
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

func NewFeatureHandler(db *sql.DB) *FeatureHandler {
	return &FeatureHandler{db: db}
}

func (h *FeatureHandler) ListRentals(w http.ResponseWriter, r *http.Request) {
	h.listFeature(w, r, "rentals")
}

func (h *FeatureHandler) CreateRental(w http.ResponseWriter, r *http.Request) {
	h.createFeature(w, r, "rentals")
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

func (h *FeatureHandler) createFeature(w http.ResponseWriter, r *http.Request, featureKey string) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var req struct {
		SectionKey  string          `json:"sectionKey"`
		Title       string          `json:"title"`
		Description string          `json:"description"`
		Status      string          `json:"status"`
		Location    string          `json:"location"`
		Metadata    json.RawMessage `json:"metadata"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.SectionKey = strings.TrimSpace(req.SectionKey)
	req.Title = strings.TrimSpace(req.Title)
	req.Status = strings.TrimSpace(req.Status)
	if req.Status == "" {
		req.Status = "active"
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}

	if req.SectionKey == "" || req.Title == "" {
		writeError(w, http.StatusBadRequest, "sectionKey and title are required")
		return
	}

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
		user.ID,
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
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not create feature item")
		return
	}

	WriteJSON(w, http.StatusCreated, map[string]any{"item": item})
}
