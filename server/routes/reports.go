package routes

import (
	"archive/zip"
	"bytes"
	"context"
	"database/sql"
	"encoding/csv"
	"encoding/xml"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ReportHandler struct {
	db *sql.DB
}

type FeatureReport struct {
	FeatureKey    string           `json:"featureKey"`
	GeneratedAt   time.Time        `json:"generatedAt"`
	Period        string           `json:"period"`
	KPIs          []ReportMetric   `json:"kpis"`
	Funnel        []ReportMetric   `json:"funnel"`
	Trends        []ReportMetric   `json:"trends"`
	AccountLevels []ReportMetric   `json:"accountLevels"`
	FollowUps     []ReportFollowUp `json:"followUps"`
	Bottlenecks   []ReportMetric   `json:"bottlenecks"`
}

type ReportMetric struct {
	Label  string `json:"label"`
	Value  string `json:"value"`
	Detail string `json:"detail"`
}

type ReportFollowUp struct {
	ID       int64      `json:"id"`
	Title    string     `json:"title"`
	Status   string     `json:"status"`
	Priority string     `json:"priority"`
	OwnerID  *int64     `json:"ownerId,omitempty"`
	DueAt    *time.Time `json:"dueAt,omitempty"`
	Detail   string     `json:"detail"`
}

func NewReportHandler(db *sql.DB) *ReportHandler {
	return &ReportHandler{db: db}
}

func (h *ReportHandler) FeatureReport(w http.ResponseWriter, r *http.Request) {
	featureKey := strings.TrimSpace(r.PathValue("feature"))
	if !isKnownFeature(featureKey) {
		writeError(w, http.StatusNotFound, "Feature report not found")
		return
	}

	report, err := h.buildFeatureReport(r.Context(), featureKey)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not build report")
		return
	}

	WriteJSON(w, http.StatusOK, map[string]any{"report": report})
}

func (h *ReportHandler) ExportFeatureReport(w http.ResponseWriter, r *http.Request) {
	featureKey := strings.TrimSpace(r.PathValue("feature"))
	if !isKnownFeature(featureKey) {
		writeError(w, http.StatusNotFound, "Feature report not found")
		return
	}

	report, err := h.buildFeatureReport(r.Context(), featureKey)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not export report")
		return
	}

	rows := reportRows(report)
	fileBase := featureKey + "_report_" + time.Now().UTC().Format("2006-01-02")
	switch strings.ToLower(strings.TrimSpace(r.URL.Query().Get("format"))) {
	case "xlsx":
		content, err := buildSimpleXLSX(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Could not build XLSX report")
			return
		}
		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		w.Header().Set("Content-Disposition", `attachment; filename="`+fileBase+`.xlsx"`)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(content)
	default:
		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", `attachment; filename="`+fileBase+`.csv"`)
		w.WriteHeader(http.StatusOK)
		writer := csv.NewWriter(w)
		_ = writer.WriteAll(rows)
	}
}

func (h *ReportHandler) buildFeatureReport(ctx context.Context, featureKey string) (FeatureReport, error) {
	totalItems, err := h.countFeatureItems(ctx, featureKey, "")
	if err != nil {
		return FeatureReport{}, err
	}
	recentItems, err := h.countFeatureItems(ctx, featureKey, "AND created_at >= NOW() - INTERVAL '30 days'")
	if err != nil {
		return FeatureReport{}, err
	}
	openTasks, err := h.countTasks(ctx, featureKey, "AND status IN ('open', 'in_progress')")
	if err != nil {
		return FeatureReport{}, err
	}
	overdueTasks, err := h.countTasks(ctx, featureKey, "AND status IN ('open', 'in_progress') AND due_at IS NOT NULL AND due_at < NOW()")
	if err != nil {
		return FeatureReport{}, err
	}
	avgStageHours, err := h.averageStageHours(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}

	funnel, err := h.funnel(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}
	trends, err := h.trends(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}
	accountLevels, err := h.accountLevels(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}
	followUps, err := h.followUps(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}
	bottlenecks, err := h.bottlenecks(ctx, featureKey)
	if err != nil {
		return FeatureReport{}, err
	}

	return FeatureReport{
		FeatureKey:  featureKey,
		GeneratedAt: time.Now().UTC(),
		Period:      "Last 30 days",
		KPIs: []ReportMetric{
			{Label: "Total records", Value: formatInt(totalItems), Detail: "All records in this feature workspace"},
			{Label: "New records", Value: formatInt(recentItems), Detail: "Created in the last 30 days"},
			{Label: "Open follow-ups", Value: formatInt(openTasks), Detail: formatInt(overdueTasks) + " overdue"},
			{Label: "Average stage age", Value: formatHours(avgStageHours), Detail: "Based on status-history records"},
		},
		Funnel:        funnel,
		Trends:        trends,
		AccountLevels: accountLevels,
		FollowUps:     followUps,
		Bottlenecks:   bottlenecks,
	}, nil
}

func (h *ReportHandler) countFeatureItems(ctx context.Context, featureKey string, suffix string) (int, error) {
	var count int
	err := h.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM feature_items WHERE feature_key = $1 `+suffix, featureKey).Scan(&count)
	return count, err
}

func (h *ReportHandler) countTasks(ctx context.Context, featureKey string, suffix string) (int, error) {
	var count int
	err := h.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sla_tasks WHERE feature_key = $1 `+suffix, featureKey).Scan(&count)
	return count, err
}

func (h *ReportHandler) averageStageHours(ctx context.Context, featureKey string) (float64, error) {
	var hours sql.NullFloat64
	err := h.db.QueryRowContext(
		ctx,
		`SELECT AVG(EXTRACT(EPOCH FROM (NOW() - changed_at)) / 3600)
		 FROM feature_item_status_history
		 WHERE feature_key = $1`,
		featureKey,
	).Scan(&hours)
	if !hours.Valid {
		return 0, err
	}
	return hours.Float64, err
}

func (h *ReportHandler) funnel(ctx context.Context, featureKey string) ([]ReportMetric, error) {
	sections := reportSections(featureKey)
	out := make([]ReportMetric, 0, len(sections))
	for _, section := range sections {
		var count int
		err := h.db.QueryRowContext(
			ctx,
			`SELECT COUNT(*) FROM feature_items WHERE feature_key = $1 AND section_key = $2`,
			featureKey,
			section,
		).Scan(&count)
		if err != nil {
			return nil, err
		}
		out = append(out, ReportMetric{
			Label:  titleize(section),
			Value:  formatInt(count),
			Detail: "Records currently tracked for " + section,
		})
	}
	return out, nil
}

func (h *ReportHandler) trends(ctx context.Context, featureKey string) ([]ReportMetric, error) {
	rows, err := h.db.QueryContext(
		ctx,
		`SELECT created_at::date AS day, COUNT(*)
		 FROM feature_items
		 WHERE feature_key = $1 AND created_at >= NOW() - INTERVAL '14 days'
		 GROUP BY day
		 ORDER BY day`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ReportMetric{}
	for rows.Next() {
		var day time.Time
		var count int
		if err := rows.Scan(&day, &count); err != nil {
			return nil, err
		}
		out = append(out, ReportMetric{
			Label:  day.Format("Jan 2"),
			Value:  formatInt(count),
			Detail: "New records",
		})
	}
	return out, rows.Err()
}

func (h *ReportHandler) accountLevels(ctx context.Context, featureKey string) ([]ReportMetric, error) {
	rows, err := h.db.QueryContext(
		ctx,
		`SELECT COALESCE(u.role, 'unassigned') AS role, COUNT(fi.id)
		 FROM feature_items fi
		 LEFT JOIN users u ON u.id = fi.owner_id
		 WHERE fi.feature_key = $1
		 GROUP BY role
		 ORDER BY role`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ReportMetric{}
	for rows.Next() {
		var role string
		var count int
		if err := rows.Scan(&role, &count); err != nil {
			return nil, err
		}
		out = append(out, ReportMetric{
			Label:  titleize(role),
			Value:  formatInt(count),
			Detail: "Feature records owned by this account role",
		})
	}
	return out, rows.Err()
}

func (h *ReportHandler) followUps(ctx context.Context, featureKey string) ([]ReportFollowUp, error) {
	rows, err := h.db.QueryContext(
		ctx,
		`SELECT id, title, description, status, priority, owner_id, due_at
		 FROM sla_tasks
		 WHERE feature_key = $1 AND status IN ('open', 'in_progress')
		 ORDER BY due_at NULLS LAST, created_at DESC
		 LIMIT 8`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ReportFollowUp{}
	for rows.Next() {
		item := ReportFollowUp{}
		var owner sql.NullInt64
		var due sql.NullTime
		if err := rows.Scan(&item.ID, &item.Title, &item.Detail, &item.Status, &item.Priority, &owner, &due); err != nil {
			return nil, err
		}
		if owner.Valid {
			item.OwnerID = &owner.Int64
		}
		if due.Valid {
			item.DueAt = &due.Time
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (h *ReportHandler) bottlenecks(ctx context.Context, featureKey string) ([]ReportMetric, error) {
	rows, err := h.db.QueryContext(
		ctx,
		`SELECT status, COUNT(*)
		 FROM feature_items
		 WHERE feature_key = $1
		 GROUP BY status
		 ORDER BY COUNT(*) DESC, status
		 LIMIT 6`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []ReportMetric{}
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		out = append(out, ReportMetric{
			Label:  titleize(status),
			Value:  formatInt(count),
			Detail: "Records currently in this status",
		})
	}
	return out, rows.Err()
}

func reportRows(report FeatureReport) [][]string {
	rows := [][]string{
		{"Feature", report.FeatureKey},
		{"Generated at", report.GeneratedAt.Format(time.RFC3339)},
		{"Period", report.Period},
		{},
		{"Section", "Label", "Value", "Detail"},
	}
	appendMetrics := func(section string, metrics []ReportMetric) {
		for _, metric := range metrics {
			rows = append(rows, []string{section, metric.Label, metric.Value, metric.Detail})
		}
	}
	appendMetrics("KPI", report.KPIs)
	appendMetrics("Funnel", report.Funnel)
	appendMetrics("Trend", report.Trends)
	appendMetrics("Account", report.AccountLevels)
	appendMetrics("Bottleneck", report.Bottlenecks)
	for _, item := range report.FollowUps {
		due := ""
		if item.DueAt != nil {
			due = item.DueAt.Format(time.RFC3339)
		}
		rows = append(rows, []string{"Follow-up", item.Title, item.Status + " / " + item.Priority, item.Detail + " Due: " + due})
	}
	return rows
}

func buildSimpleXLSX(rows [][]string) ([]byte, error) {
	buffer := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buffer)
	files := map[string]string{
		"[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
		"_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
		"xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
		"xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
		"xl/worksheets/sheet1.xml": worksheetXML(rows),
	}
	for name, content := range files {
		file, err := zipWriter.Create(name)
		if err != nil {
			return nil, err
		}
		if _, err := file.Write([]byte(content)); err != nil {
			return nil, err
		}
	}
	if err := zipWriter.Close(); err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func worksheetXML(rows [][]string) string {
	var builder strings.Builder
	builder.WriteString(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`)
	for rowIndex, row := range rows {
		builder.WriteString(`<row r="` + strconv.Itoa(rowIndex+1) + `">`)
		for colIndex, value := range row {
			cellRef := columnName(colIndex+1) + strconv.Itoa(rowIndex+1)
			builder.WriteString(`<c r="` + cellRef + `" t="inlineStr"><is><t>`)
			_ = xml.EscapeText(&builder, []byte(value))
			builder.WriteString(`</t></is></c>`)
		}
		builder.WriteString(`</row>`)
	}
	builder.WriteString(`</sheetData></worksheet>`)
	return builder.String()
}

func columnName(index int) string {
	name := ""
	for index > 0 {
		index--
		name = string(rune('A'+index%26)) + name
		index /= 26
	}
	return name
}

func isKnownFeature(featureKey string) bool {
	switch featureKey {
	case "rentals", "warehouses", "spaces":
		return true
	default:
		return false
	}
}

func reportSections(featureKey string) []string {
	switch featureKey {
	case "rentals":
		return []string{"property-listings", "viewing-requests", "applications", "leases"}
	case "warehouses":
		return []string{"storage-requests", "warehouse-listings", "logistics-support", "contracts"}
	case "spaces":
		return []string{"events", "bookings", "tickets", "blogs"}
	default:
		return []string{}
	}
}

func titleize(value string) string {
	value = strings.ReplaceAll(value, "-", " ")
	value = strings.ReplaceAll(value, "_", " ")
	if value == "" {
		return "Unknown"
	}
	return strings.ToUpper(value[:1]) + value[1:]
}

func formatInt(value int) string {
	return strconv.Itoa(value)
}

func formatHours(hours float64) string {
	if hours <= 0 {
		return "0h"
	}
	if hours < 24 {
		return fmt.Sprintf("%.1fh", hours)
	}
	return fmt.Sprintf("%.1fd", hours/24)
}
