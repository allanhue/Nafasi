package model

import (
	"context"
	"database/sql"
	"time"
)

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

type ReportCount struct {
	Key   string
	Count int
}

type ReportTrend struct {
	Day   time.Time
	Count int
}

type FeatureReportData struct {
	TotalItems        int
	RecentItems       int
	OpenTasks         int
	OverdueTasks      int
	AverageStageHours float64
	Sections          []ReportCount
	Trends            []ReportTrend
	AccountLevels     []ReportCount
	FollowUps         []ReportFollowUp
	Bottlenecks       []ReportCount
}

type Reports struct {
	db *sql.DB
}

func NewReports(db *sql.DB) *Reports {
	return &Reports{db: db}
}

func (m *Reports) Data(ctx context.Context, featureKey string, sections []string) (FeatureReportData, error) {
	data := FeatureReportData{}
	var err error
	if data.TotalItems, err = m.countFeatureItems(ctx, featureKey, ""); err != nil {
		return data, err
	}
	if data.RecentItems, err = m.countFeatureItems(ctx, featureKey, "AND created_at >= NOW() - INTERVAL '30 days'"); err != nil {
		return data, err
	}
	if data.OpenTasks, err = m.countTasks(ctx, featureKey, "AND status IN ('open', 'in_progress')"); err != nil {
		return data, err
	}
	if data.OverdueTasks, err = m.countTasks(ctx, featureKey, "AND status IN ('open', 'in_progress') AND due_at IS NOT NULL AND due_at < NOW()"); err != nil {
		return data, err
	}
	if data.AverageStageHours, err = m.averageStageHours(ctx, featureKey); err != nil {
		return data, err
	}
	if data.Sections, err = m.countSections(ctx, featureKey, sections); err != nil {
		return data, err
	}
	if data.Trends, err = m.trends(ctx, featureKey); err != nil {
		return data, err
	}
	if data.AccountLevels, err = m.accountLevels(ctx, featureKey); err != nil {
		return data, err
	}
	if data.FollowUps, err = m.followUps(ctx, featureKey); err != nil {
		return data, err
	}
	if data.Bottlenecks, err = m.bottlenecks(ctx, featureKey); err != nil {
		return data, err
	}
	return data, nil
}

func (m *Reports) countFeatureItems(ctx context.Context, featureKey, suffix string) (int, error) {
	var count int
	err := m.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM feature_items WHERE feature_key = $1 `+suffix, featureKey).Scan(&count)
	return count, err
}

func (m *Reports) countTasks(ctx context.Context, featureKey, suffix string) (int, error) {
	var count int
	err := m.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM sla_tasks WHERE feature_key = $1 `+suffix, featureKey).Scan(&count)
	return count, err
}

func (m *Reports) averageStageHours(ctx context.Context, featureKey string) (float64, error) {
	var hours sql.NullFloat64
	err := m.db.QueryRowContext(ctx,
		`SELECT AVG(EXTRACT(EPOCH FROM (NOW() - changed_at)) / 3600)
		 FROM feature_item_status_history WHERE feature_key = $1`,
		featureKey,
	).Scan(&hours)
	if !hours.Valid {
		return 0, err
	}
	return hours.Float64, err
}

func (m *Reports) countSections(ctx context.Context, featureKey string, sections []string) ([]ReportCount, error) {
	out := make([]ReportCount, 0, len(sections))
	for _, section := range sections {
		var count int
		if err := m.db.QueryRowContext(ctx,
			`SELECT COUNT(*) FROM feature_items WHERE feature_key = $1 AND section_key = $2`,
			featureKey, section,
		).Scan(&count); err != nil {
			return nil, err
		}
		out = append(out, ReportCount{Key: section, Count: count})
	}
	return out, nil
}

func (m *Reports) trends(ctx context.Context, featureKey string) ([]ReportTrend, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT created_at::date AS day, COUNT(*) FROM feature_items
		 WHERE feature_key = $1 AND created_at >= NOW() - INTERVAL '14 days'
		 GROUP BY day ORDER BY day`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []ReportTrend{}
	for rows.Next() {
		var item ReportTrend
		if err := rows.Scan(&item.Day, &item.Count); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (m *Reports) accountLevels(ctx context.Context, featureKey string) ([]ReportCount, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT COALESCE(u.role, 'unassigned') AS role, COUNT(fi.id)
		 FROM feature_items fi LEFT JOIN users u ON u.id = fi.owner_id
		 WHERE fi.feature_key = $1 GROUP BY role ORDER BY role`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []ReportCount{}
	for rows.Next() {
		var item ReportCount
		if err := rows.Scan(&item.Key, &item.Count); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (m *Reports) followUps(ctx context.Context, featureKey string) ([]ReportFollowUp, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT id, title, description, status, priority, owner_id, due_at
		 FROM sla_tasks WHERE feature_key = $1 AND status IN ('open', 'in_progress')
		 ORDER BY due_at NULLS LAST, created_at DESC LIMIT 8`,
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

func (m *Reports) bottlenecks(ctx context.Context, featureKey string) ([]ReportCount, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT status, COUNT(*) FROM feature_items WHERE feature_key = $1
		 GROUP BY status ORDER BY COUNT(*) DESC, status LIMIT 6`,
		featureKey,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []ReportCount{}
	for rows.Next() {
		var item ReportCount
		if err := rows.Scan(&item.Key, &item.Count); err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}
