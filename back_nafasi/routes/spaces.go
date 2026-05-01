package routes

import "net/http"

func (h *FeatureHandler) ListSpaces(w http.ResponseWriter, r *http.Request) {
	h.listFeature(w, r, "spaces")
}

func (h *FeatureHandler) CreateSpace(w http.ResponseWriter, r *http.Request) {
	h.createFeature(w, r, "spaces")
}
