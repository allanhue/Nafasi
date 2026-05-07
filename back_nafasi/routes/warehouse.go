package routes

import "net/http"

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
