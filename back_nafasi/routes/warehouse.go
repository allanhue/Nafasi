package routes

import "net/http"

func (h *FeatureHandler) ListWarehouses(w http.ResponseWriter, r *http.Request) {
	h.listFeature(w, r, "warehouses")
}

func (h *FeatureHandler) CreateWarehouse(w http.ResponseWriter, r *http.Request) {
	h.createFeature(w, r, "warehouses")
}
