package routes

import (
	"net/http"
	"strings"
	"time"

	"nafasi_new/back_nafasi/service"
)

type ReportHandler struct {
	reports *service.Reports
}

func NewReportHandler(reports *service.Reports) *ReportHandler {
	return &ReportHandler{reports: reports}
}

func (h *ReportHandler) FeatureReport(w http.ResponseWriter, r *http.Request) {
	featureKey := strings.TrimSpace(r.PathValue("feature"))
	if !h.reports.KnownFeature(featureKey) {
		writeError(w, http.StatusNotFound, "Feature report not found")
		return
	}
	report, err := h.reports.FeatureReport(r.Context(), featureKey)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not build report")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"report": report})
}

func (h *ReportHandler) ExportFeatureReport(w http.ResponseWriter, r *http.Request) {
	featureKey := strings.TrimSpace(r.PathValue("feature"))
	if !h.reports.KnownFeature(featureKey) {
		writeError(w, http.StatusNotFound, "Feature report not found")
		return
	}
	content, contentType, err := h.reports.ExportFeatureReport(
		r.Context(), featureKey, r.URL.Query().Get("format"),
	)
	if err != nil {
		message := "Could not export report"
		if strings.EqualFold(strings.TrimSpace(r.URL.Query().Get("format")), "xlsx") {
			message = "Could not build XLSX report"
		}
		writeError(w, http.StatusInternalServerError, message)
		return
	}
	fileBase := featureKey + "_report_" + time.Now().UTC().Format("2006-01-02")
	if strings.EqualFold(strings.TrimSpace(r.URL.Query().Get("format")), "xlsx") {
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", `attachment; filename="`+fileBase+`.xlsx"`)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(content)
		return
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", `attachment; filename="`+fileBase+`.csv"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(content)
}
