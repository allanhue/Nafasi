package service

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/csv"
	"encoding/xml"
	"fmt"
	"strconv"
	"strings"
	"time"

	"nafasi_new/back_nafasi/model"
)

type Reports struct {
	repository *model.Reports
}

func NewReports(repository *model.Reports) *Reports {
	return &Reports{repository: repository}
}

func (s *Reports) KnownFeature(featureKey string) bool {
	return featureKey == "rentals" || featureKey == "warehouses"
}

func (s *Reports) FeatureReport(ctx context.Context, featureKey string) (model.FeatureReport, error) {
	sections := reportSections(featureKey)
	data, err := s.repository.Data(ctx, featureKey, sections)
	if err != nil {
		return model.FeatureReport{}, err
	}
	funnel := make([]model.ReportMetric, 0, len(data.Sections))
	for _, item := range data.Sections {
		funnel = append(funnel, model.ReportMetric{
			Label: titleize(item.Key), Value: formatInt(item.Count),
			Detail: "Records currently tracked for " + item.Key,
		})
	}
	trends := make([]model.ReportMetric, 0, len(data.Trends))
	for _, item := range data.Trends {
		trends = append(trends, model.ReportMetric{
			Label: item.Day.Format("Jan 2"), Value: formatInt(item.Count), Detail: "New records",
		})
	}
	accounts := make([]model.ReportMetric, 0, len(data.AccountLevels))
	for _, item := range data.AccountLevels {
		accounts = append(accounts, model.ReportMetric{
			Label: titleize(item.Key), Value: formatInt(item.Count),
			Detail: "Feature records owned by this account role",
		})
	}
	bottlenecks := make([]model.ReportMetric, 0, len(data.Bottlenecks))
	for _, item := range data.Bottlenecks {
		bottlenecks = append(bottlenecks, model.ReportMetric{
			Label: titleize(item.Key), Value: formatInt(item.Count),
			Detail: "Records currently in this status",
		})
	}
	return model.FeatureReport{
		FeatureKey: featureKey, GeneratedAt: time.Now().UTC(), Period: "Last 30 days",
		KPIs: []model.ReportMetric{
			{Label: "Total records", Value: formatInt(data.TotalItems), Detail: "All records in this feature workspace"},
			{Label: "New records", Value: formatInt(data.RecentItems), Detail: "Created in the last 30 days"},
			{Label: "Open follow-ups", Value: formatInt(data.OpenTasks), Detail: formatInt(data.OverdueTasks) + " overdue"},
			{Label: "Average stage age", Value: formatHours(data.AverageStageHours), Detail: "Based on status-history records"},
		},
		Funnel: funnel, Trends: trends, AccountLevels: accounts,
		FollowUps: data.FollowUps, Bottlenecks: bottlenecks,
	}, nil
}

func (s *Reports) ExportFeatureReport(ctx context.Context, featureKey, format string) ([]byte, string, error) {
	report, err := s.FeatureReport(ctx, featureKey)
	if err != nil {
		return nil, "", err
	}
	rows := reportRows(report)
	if strings.EqualFold(strings.TrimSpace(format), "xlsx") {
		content, err := buildSimpleXLSX(rows)
		if err != nil {
			return nil, "", err
		}
		return content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nil
	}
	buffer := &bytes.Buffer{}
	writer := csv.NewWriter(buffer)
	writer.WriteAll(rows)
	if err := writer.Error(); err != nil {
		return nil, "", err
	}
	return buffer.Bytes(), "text/csv", nil
}

func reportRows(report model.FeatureReport) [][]string {
	rows := [][]string{
		{"Feature", report.FeatureKey},
		{"Generated at", report.GeneratedAt.Format(time.RFC3339)},
		{"Period", report.Period},
		{},
		{"Section", "Label", "Value", "Detail"},
	}
	appendMetrics := func(section string, metrics []model.ReportMetric) {
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

func reportSections(featureKey string) []string {
	switch featureKey {
	case "rentals":
		return []string{"property-listings", "viewing-requests", "applications", "leases"}
	case "warehouses":
		return []string{"storage-requests", "warehouse-listings", "logistics-support", "contracts"}
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
