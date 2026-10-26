package routes

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"nafasi_new/back_nafasi/model"
	"nafasi_new/back_nafasi/service"
)

type FeatureHandler struct {
	items *service.FeatureItems
}

func NewFeatureHandler(items *service.FeatureItems) *FeatureHandler {
	return &FeatureHandler{items: items}
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

func (h *FeatureHandler) ListWarehouses(w http.ResponseWriter, r *http.Request) {
	h.listFeature(w, r, "warehouses")
}

func (h *FeatureHandler) CreateWarehouse(w http.ResponseWriter, r *http.Request) {
	h.createFeature(w, r, "warehouses")
}

func (h *FeatureHandler) ListWarehouseModule(w http.ResponseWriter, r *http.Request) {
	h.listFeatureModule(w, r, "warehouses")
}

func (h *FeatureHandler) CreateWarehouseModule(w http.ResponseWriter, r *http.Request) {
	h.createFeatureModule(w, r, "warehouses")
}

func (h *FeatureHandler) listFeature(w http.ResponseWriter, r *http.Request, featureKey string) {
	items, err := h.items.List(r.Context(), featureKey, strings.TrimSpace(r.URL.Query().Get("section")))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load feature items")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *FeatureHandler) listFeatureModule(w http.ResponseWriter, r *http.Request, featureKey string) {
	sectionKey := strings.TrimSpace(r.PathValue("section"))
	items, err := h.items.ListSection(r.Context(), featureKey, sectionKey)
	if err != nil {
		var featureErr *service.FeatureError
		if errors.As(err, &featureErr) && featureErr.Kind == "not_found" {
			writeError(w, http.StatusNotFound, featureErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not load feature items")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{
		"featureKey": featureKey, "sectionKey": sectionKey, "items": items,
	})
}

func (h *FeatureHandler) createFeature(w http.ResponseWriter, r *http.Request, featureKey string) {
	h.createFeatureWithSection(w, r, featureKey, "")
}

func (h *FeatureHandler) createFeatureModule(w http.ResponseWriter, r *http.Request, featureKey string) {
	sectionKey := strings.TrimSpace(r.PathValue("section"))
	h.createFeatureWithSection(w, r, featureKey, sectionKey)
}

func (h *FeatureHandler) createFeatureWithSection(w http.ResponseWriter, r *http.Request, featureKey, sectionKey string) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	input := model.FeatureItemInput{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if sectionKey != "" {
		input.SectionKey = sectionKey
	}
	item, err := h.items.Create(r.Context(), model.FeatureActor{ID: user.ID, Name: user.Name, Role: user.Role}, featureKey, input, sectionKey != "")
	if err != nil {
		var featureErr *service.FeatureError
		if errors.As(err, &featureErr) {
			if featureErr.Kind == "not_found" {
				writeError(w, http.StatusNotFound, featureErr.Message)
				return
			}
			writeError(w, http.StatusBadRequest, featureErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "Could not create feature item")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]any{"item": item})
}
