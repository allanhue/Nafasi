package model

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type FinanceActor struct {
	ID   int64
	Name string
	Role string
}

type RentalUnit struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	Location string `json:"location"`
}

type RentalTenant struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type RentalLease struct {
	ID            int64  `json:"id"`
	UnitID        int64  `json:"unitId"`
	Unit          string `json:"unit"`
	Property      string `json:"property"`
	TenantID      int64  `json:"tenantId"`
	Tenant        string `json:"tenant"`
	MonthlyRent   string `json:"monthlyRent"`
	DueDay        int    `json:"dueDay"`
	StartDate     string `json:"startDate"`
	Balance       string `json:"balance"`
	Status        string `json:"status"`
	InvoicedTotal string `json:"-"`
	InvoiceCount  int    `json:"-"`
}

type RentReceipt struct {
	ReceiptNumber string   `json:"receiptNumber"`
	TenantName    string   `json:"tenantName"`
	UnitName      string   `json:"unitName"`
	LandlordName  string   `json:"landlordName"`
	Amount        string   `json:"amount"`
	Method        string   `json:"method"`
	PaymentDate   string   `json:"paymentDate"`
	RentPeriods   []string `json:"rentPeriods"`
	BalanceAfter  string   `json:"balanceAfter"`
	RecordedBy    string   `json:"recordedBy"`
	Reference     string   `json:"reference"`
	Notes         string   `json:"notes"`
}

type PaymentReceipt struct {
	ID int64 `json:"id"`
	RentReceipt
}

type RentArrears struct {
	InvoiceID   int64  `json:"invoiceId"`
	LeaseID     int64  `json:"leaseId"`
	Unit        string `json:"unit"`
	Tenant      string `json:"tenant"`
	Period      string `json:"period"`
	DueDate     string `json:"dueDate"`
	DaysOverdue int    `json:"daysOverdue"`
	Balance     string `json:"balance"`
	Bucket      string `json:"bucket"`
}

type RentalFinanceWorkspace struct {
	Units          []RentalUnit      `json:"units"`
	Tenants        []RentalTenant    `json:"tenants"`
	Leases         []RentalLease     `json:"leases"`
	Receipts       []PaymentReceipt  `json:"receipts"`
	Arrears        []RentArrears     `json:"arrears"`
	ArrearsBuckets map[string]string `json:"arrearsBuckets"`
}

type CreateRentalLeaseInput struct {
	UnitID      int64  `json:"unitId"`
	TenantID    int64  `json:"tenantId"`
	TenantName  string `json:"tenantName"`
	TenantEmail string `json:"tenantEmail"`
	TenantPhone string `json:"tenantPhone"`
	MonthlyRent string `json:"monthlyRent"`
	DueDay      int    `json:"dueDay"`
	StartDate   string `json:"startDate"`
}

type RecordRentPaymentInput struct {
	LeaseID        int64  `json:"leaseId"`
	Amount         string `json:"amount"`
	Method         string `json:"method"`
	PaymentDate    string `json:"paymentDate"`
	Reference      string `json:"reference"`
	Notes          string `json:"notes"`
	IdempotencyKey string `json:"idempotencyKey"`
}

type FinancePersistenceError struct {
	Kind    string
	Message string
}

func (e *FinancePersistenceError) Error() string {
	return e.Message
}

func financeError(kind, message string) error {
	return &FinancePersistenceError{Kind: kind, Message: message}
}

type RentalFinance struct {
	db *sql.DB
}

func NewRentalFinance(db *sql.DB) *RentalFinance {
	return &RentalFinance{db: db}
}

type RentInvoiceBalance struct {
	ID        int64
	Period    string
	Remaining int64
}

type PaymentAllocation struct {
	InvoiceID int64
	Period    string
	Amount    int64
}

func (m *RentalFinance) Workspace(ctx context.Context, actor FinanceActor) (RentalFinanceWorkspace, error) {
	workspace := RentalFinanceWorkspace{
		Units: []RentalUnit{}, Tenants: []RentalTenant{}, Leases: []RentalLease{},
		Receipts: []PaymentReceipt{}, Arrears: []RentArrears{},
		ArrearsBuckets: map[string]string{},
	}
	var err error
	if workspace.Units, err = m.listAvailableUnits(ctx, actor); err != nil {
		return workspace, err
	}
	if workspace.Tenants, err = m.listTenants(ctx, actor); err != nil {
		return workspace, err
	}
	if workspace.Leases, err = m.listLeases(ctx, actor); err != nil {
		return workspace, err
	}
	if workspace.Receipts, err = m.listPayments(ctx, actor); err != nil {
		return workspace, err
	}
	if workspace.Arrears, err = m.listArrears(ctx, actor); err != nil {
		return workspace, err
	}
	return workspace, nil
}

func (m *RentalFinance) CreateLease(ctx context.Context, actor FinanceActor, req CreateRentalLeaseInput, rentCents int64, startDate time.Time) error {
	var err error
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var ownerID sql.NullInt64
	err = tx.QueryRowContext(
		ctx,
		`SELECT owner_id FROM feature_items
		 WHERE id = $1 AND feature_key = 'rentals' AND section_key = 'property-listings'`+unitScope(actor)+`
		 FOR UPDATE`,
		append([]any{req.UnitID}, unitScopeArgs(actor)...)...,
	).Scan(&ownerID)
	if errors.Is(err, sql.ErrNoRows) {
		return financeError("not_found", "Rental unit not found or not accessible")
	}
	if err != nil {
		return err
	}

	var hasActiveLease bool
	err = tx.QueryRowContext(ctx,
		`SELECT EXISTS (SELECT 1 FROM rental_leases WHERE feature_item_id = $1 AND status = 'active')`,
		req.UnitID,
	).Scan(&hasActiveLease)
	if err != nil {
		return err
	}
	if hasActiveLease {
		return financeError("conflict", "This unit already has an active tenancy")
	}

	providerID := actor.ID
	if ownerID.Valid {
		providerID = ownerID.Int64
	}
	var rentalTenantID int64
	if req.TenantID > 0 {
		err = tx.QueryRowContext(ctx,
			`SELECT id FROM rental_tenants WHERE id = $1 AND provider_id = $2`,
			req.TenantID, providerID,
		).Scan(&rentalTenantID)
		if errors.Is(err, sql.ErrNoRows) {
			return financeError("not_found", "Tenant not found for this landlord")
		}
		if err != nil {
			return err
		}
	} else {
		var emailValue any
		if req.TenantEmail != "" {
			emailValue = req.TenantEmail
		}
		err = tx.QueryRowContext(ctx,
			`INSERT INTO rental_tenants (provider_id, name, email, phone)
			 VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id`,
			providerID, req.TenantName, emailValue, req.TenantPhone,
		).Scan(&rentalTenantID)
		if errors.Is(err, sql.ErrNoRows) && req.TenantEmail != "" {
			err = tx.QueryRowContext(ctx,
				`SELECT id FROM rental_tenants WHERE provider_id = $1 AND email = $2`,
				providerID, req.TenantEmail,
			).Scan(&rentalTenantID)
		}
		if err != nil {
			return err
		}
	}
	_, err = tx.ExecContext(ctx,
		`INSERT INTO rental_leases
			(feature_item_id, rental_tenant_id, provider_id, monthly_rent, due_day, start_date, payment_status, status)
		 VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'active')`,
		req.UnitID, rentalTenantID, providerID, amountDecimal(rentCents), req.DueDay, startDate,
	)
	if err != nil {
		if strings.Contains(err.Error(), "idx_rental_leases_active_unit") {
			return financeError("conflict", "This unit already has an active tenancy")
		}
		return err
	}
	return tx.Commit()
}

type RentInvoiceDate struct {
	PeriodStart time.Time
	DueDate     time.Time
}

func (m *RentalFinance) InvoiceSchedule(ctx context.Context, actor FinanceActor, leaseID int64) (time.Time, int, error) {
	var startDate time.Time
	var dueDay int
	err := m.db.QueryRowContext(ctx,
		`SELECT start_date, due_day FROM rental_leases l
		 WHERE l.id = $1 AND l.status = 'active'`+leaseScope(actor),
		append([]any{leaseID}, leaseScopeArgs(actor)...)...,
	).Scan(&startDate, &dueDay)
	return startDate, dueDay, err
}

func (m *RentalFinance) CreateInvoices(ctx context.Context, actor FinanceActor, leaseID int64, dates []RentInvoiceDate) (int, error) {
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	var activeLeaseID int64
	err = tx.QueryRowContext(ctx,
		`SELECT l.id FROM rental_leases l WHERE l.id = $1 AND l.status = 'active'`+leaseScope(actor)+`
		 FOR UPDATE`,
		append([]any{leaseID}, leaseScopeArgs(actor)...)...,
	).Scan(&activeLeaseID)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, financeError("not_found", "Active tenancy not found or not accessible")
	}
	if err != nil {
		return 0, err
	}
	created := 0
	for _, date := range dates {
		result, insertErr := tx.ExecContext(ctx,
			`INSERT INTO rental_invoices (lease_id, period_start, due_date, amount)
			 SELECT id, $2, $3, monthly_rent FROM rental_leases WHERE id = $1
			 ON CONFLICT (lease_id, period_start) DO NOTHING`,
			leaseID, date.PeriodStart.Format("2006-01-02"), date.DueDate.Format("2006-01-02"),
		)
		if insertErr != nil {
			return 0, insertErr
		}
		rows, rowsErr := result.RowsAffected()
		if rowsErr != nil {
			return 0, rowsErr
		}
		created += int(rows)
	}
	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return created, nil
}

func (m *RentalFinance) RecordPayment(
	ctx context.Context,
	actor FinanceActor,
	req RecordRentPaymentInput,
	receiptNumber string,
	amountCents int64,
	paidAt time.Time,
	allocate func(int64, []RentInvoiceBalance) ([]PaymentAllocation, int64, error),
) (RentReceipt, error) {
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return RentReceipt{}, err
	}
	defer tx.Rollback()

	var rentalTenantID sql.NullInt64
	var providerID int64
	var tenantName, landlordName, unitName string
	err = tx.QueryRowContext(ctx,
		`SELECT l.rental_tenant_id, l.provider_id,
		 COALESCE(tenant.name, legacy_tenant.name, 'Former tenant'), landlord.name, unit.title
		 FROM rental_leases l
		 LEFT JOIN rental_tenants tenant ON tenant.id = l.rental_tenant_id
		 LEFT JOIN users legacy_tenant ON legacy_tenant.id = l.tenant_id
		 JOIN users landlord ON landlord.id = l.provider_id
		 JOIN feature_items unit ON unit.id = l.feature_item_id
		 WHERE l.id = $1 AND l.status = 'active'`+leaseScope(actor)+`
		 FOR UPDATE OF l`,
		append([]any{req.LeaseID}, leaseScopeArgs(actor)...)...,
	).Scan(&rentalTenantID, &providerID, &tenantName, &landlordName, &unitName)
	if errors.Is(err, sql.ErrNoRows) {
		return RentReceipt{}, financeError("not_found", "Active tenancy not found or not accessible")
	}
	if err != nil {
		return RentReceipt{}, err
	}
	if !rentalTenantID.Valid {
		return RentReceipt{}, financeError("conflict", "This tenancy needs a tenant record before payments can be recorded")
	}

	var existingID int64
	err = tx.QueryRowContext(ctx,
		`SELECT id FROM rental_payments WHERE idempotency_key = $1`, req.IdempotencyKey,
	).Scan(&existingID)
	if err == nil {
		return RentReceipt{}, financeError("conflict", "This payment was already submitted. Refresh the payment list.")
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return RentReceipt{}, err
	}

	invoices, err := unpaidInvoices(ctx, tx, req.LeaseID)
	if err != nil {
		return RentReceipt{}, err
	}
	allocations, balanceAfter, err := allocate(amountCents, invoices)
	if err != nil {
		return RentReceipt{}, err
	}
	var paymentID int64
	err = tx.QueryRowContext(ctx,
		`INSERT INTO rental_payments
			(lease_id, rental_tenant_id, provider_id, amount, method, paid_at, reference, notes,
			 recorded_by, idempotency_key, receipt_number, tenant_name, unit_name, landlord_name, balance_after)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		 RETURNING id`,
		req.LeaseID, rentalTenantID.Int64, providerID, amountDecimal(amountCents), req.Method, paidAt,
		req.Reference, req.Notes, actor.ID, req.IdempotencyKey, receiptNumber,
		tenantName, unitName, landlordName, amountDecimal(balanceAfter),
	).Scan(&paymentID)
	if err != nil {
		if strings.Contains(err.Error(), "idx_rental_payments_provider_reference") {
			return RentReceipt{}, financeError("conflict", "A payment with this reference has already been recorded")
		}
		if strings.Contains(err.Error(), "idempotency_key") {
			return RentReceipt{}, financeError("conflict", "This payment was already submitted. Refresh the payment list.")
		}
		return RentReceipt{}, err
	}
	for _, allocation := range allocations {
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO rental_payment_allocations (payment_id, invoice_id, amount) VALUES ($1, $2, $3)`,
			paymentID, allocation.InvoiceID, amountDecimal(allocation.Amount),
		); err != nil {
			return RentReceipt{}, err
		}
	}
	if err := tx.Commit(); err != nil {
		return RentReceipt{}, err
	}

	periods := make([]string, 0, len(allocations))
	for _, allocation := range allocations {
		periods = append(periods, allocation.Period)
	}
	return RentReceipt{
		ReceiptNumber: receiptNumber, TenantName: tenantName, UnitName: unitName,
		LandlordName: landlordName, Amount: amountDecimal(amountCents), Method: req.Method,
		PaymentDate: req.PaymentDate, RentPeriods: periods, BalanceAfter: amountDecimal(balanceAfter),
		RecordedBy: actor.Name, Reference: req.Reference, Notes: req.Notes,
	}, nil
}

func (m *RentalFinance) listAvailableUnits(ctx context.Context, actor FinanceActor) ([]RentalUnit, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT fi.id, fi.title, fi.location
		 FROM feature_items fi
		 WHERE fi.feature_key = 'rentals' AND fi.section_key = 'property-listings'
		   AND NOT EXISTS (SELECT 1 FROM rental_leases l WHERE l.feature_item_id = fi.id AND l.status = 'active')`+unitScope(actor)+`
		 ORDER BY fi.title LIMIT 500`,
		unitScopeArgs(actor)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	units := []RentalUnit{}
	for rows.Next() {
		var unit RentalUnit
		if err := rows.Scan(&unit.ID, &unit.Title, &unit.Location); err != nil {
			return nil, err
		}
		units = append(units, unit)
	}
	return units, rows.Err()
}

func (m *RentalFinance) listTenants(ctx context.Context, actor FinanceActor) ([]RentalTenant, error) {
	query := `SELECT id, name, email::text, phone FROM rental_tenants`
	args := []any{}
	if !isFinanceAdmin(actor) {
		query += ` WHERE provider_id = $1`
		args = append(args, actor.ID)
	}
	query += ` ORDER BY name LIMIT 500`
	rows, err := m.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	tenants := []RentalTenant{}
	for rows.Next() {
		var tenant RentalTenant
		var email sql.NullString
		if err := rows.Scan(&tenant.ID, &tenant.Name, &email, &tenant.Phone); err != nil {
			return nil, err
		}
		tenant.Email = email.String
		tenants = append(tenants, tenant)
	}
	return tenants, rows.Err()
}

func (m *RentalFinance) listLeases(ctx context.Context, actor FinanceActor) ([]RentalLease, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT l.id, fi.id, fi.title, COALESCE(property.title, fi.title),
		 COALESCE(tenant.id, legacy_tenant.id, 0), COALESCE(tenant.name, legacy_tenant.name, 'Former tenant'),
		 l.monthly_rent::text, l.due_day, COALESCE(l.start_date::text, ''),
		 COALESCE(SUM(inv.amount - COALESCE(allocated.total, 0)), 0)::text,
		 COALESCE(SUM(inv.amount), 0)::text, COUNT(inv.id)
		 FROM rental_leases l
		 JOIN feature_items fi ON fi.id = l.feature_item_id
		 LEFT JOIN feature_items property ON property.id = l.property_item_id
		 LEFT JOIN rental_tenants tenant ON tenant.id = l.rental_tenant_id
		 LEFT JOIN users legacy_tenant ON legacy_tenant.id = l.tenant_id
		 LEFT JOIN rental_invoices inv ON inv.lease_id = l.id
		 LEFT JOIN LATERAL (
		   SELECT SUM(a.amount) AS total FROM rental_payment_allocations a WHERE a.invoice_id = inv.id
		 ) allocated ON TRUE
		 WHERE l.status = 'active'`+leaseListScope(actor)+`
		 GROUP BY l.id, fi.id, fi.title, property.title, tenant.id, tenant.name, legacy_tenant.id, legacy_tenant.name
		 ORDER BY fi.title`,
		leaseListScopeArgs(actor)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	leases := []RentalLease{}
	for rows.Next() {
		var lease RentalLease
		var invoiced string
		var invoiceCount int
		if err := rows.Scan(&lease.ID, &lease.UnitID, &lease.Unit, &lease.Property, &lease.TenantID, &lease.Tenant,
			&lease.MonthlyRent, &lease.DueDay, &lease.StartDate, &lease.Balance, &invoiced, &invoiceCount); err != nil {
			return nil, err
		}
		lease.InvoicedTotal = invoiced
		lease.InvoiceCount = invoiceCount
		leases = append(leases, lease)
	}
	return leases, rows.Err()
}

func (m *RentalFinance) listPayments(ctx context.Context, actor FinanceActor) ([]PaymentReceipt, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT p.id, p.receipt_number, p.tenant_name, p.unit_name, p.landlord_name,
		 p.amount::text, p.method, p.paid_at::text, p.balance_after::text,
		 recorder.name, p.reference, p.notes,
		 COALESCE(string_agg(to_char(i.period_start, 'Mon YYYY'), ', ' ORDER BY i.period_start), '')
		 FROM rental_payments p
		 JOIN users recorder ON recorder.id = p.recorded_by
		 LEFT JOIN rental_payment_allocations a ON a.payment_id = p.id
		 LEFT JOIN rental_invoices i ON i.id = a.invoice_id
		 WHERE TRUE`+paymentScope(actor)+`
		 GROUP BY p.id, recorder.name
		 ORDER BY p.created_at DESC LIMIT 100`,
		paymentScopeArgs(actor)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	receipts := []PaymentReceipt{}
	for rows.Next() {
		var item PaymentReceipt
		var periods string
		if err := rows.Scan(&item.ID, &item.ReceiptNumber, &item.TenantName, &item.UnitName, &item.LandlordName,
			&item.Amount, &item.Method, &item.PaymentDate, &item.BalanceAfter, &item.RecordedBy,
			&item.Reference, &item.Notes, &periods); err != nil {
			return nil, err
		}
		if periods != "" {
			item.RentPeriods = strings.Split(periods, ", ")
		} else {
			item.RentPeriods = []string{}
		}
		receipts = append(receipts, item)
	}
	return receipts, rows.Err()
}

func (m *RentalFinance) listArrears(ctx context.Context, actor FinanceActor) ([]RentArrears, error) {
	rows, err := m.db.QueryContext(ctx,
		`SELECT i.id, l.id, fi.title, COALESCE(tenant.name, legacy_tenant.name, 'Former tenant'),
		 i.period_start::text, i.due_date::text,
		 (CURRENT_DATE - i.due_date)::int AS days_overdue,
		 (i.amount - COALESCE(allocated.total, 0))::text AS balance
		 FROM rental_invoices i
		 JOIN rental_leases l ON l.id = i.lease_id
		 JOIN feature_items fi ON fi.id = l.feature_item_id
		 LEFT JOIN rental_tenants tenant ON tenant.id = l.rental_tenant_id
		 LEFT JOIN users legacy_tenant ON legacy_tenant.id = l.tenant_id
		 LEFT JOIN LATERAL (
		   SELECT SUM(a.amount) AS total FROM rental_payment_allocations a WHERE a.invoice_id = i.id
		 ) allocated ON TRUE
		 WHERE i.due_date < CURRENT_DATE AND i.amount > COALESCE(allocated.total, 0)`+leaseListScope(actor)+`
		 ORDER BY i.due_date, fi.title`,
		leaseListScopeArgs(actor)...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	arrears := []RentArrears{}
	for rows.Next() {
		var item RentArrears
		var balance string
		if err := rows.Scan(&item.InvoiceID, &item.LeaseID, &item.Unit, &item.Tenant,
			&item.Period, &item.DueDate, &item.DaysOverdue, &balance); err != nil {
			return nil, err
		}
		item.Balance = balance
		arrears = append(arrears, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return arrears, nil
}

func unpaidInvoices(ctx context.Context, tx *sql.Tx, leaseID int64) ([]RentInvoiceBalance, error) {
	rows, err := tx.QueryContext(ctx,
		`SELECT i.id, i.period_start::text, i.amount::text,
		 COALESCE((SELECT SUM(a.amount) FROM rental_payment_allocations a WHERE a.invoice_id = i.id), 0)::text
		 FROM rental_invoices i WHERE i.lease_id = $1
		 ORDER BY i.due_date, i.period_start, i.id FOR UPDATE`,
		leaseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	invoices := []RentInvoiceBalance{}
	for rows.Next() {
		var invoice RentInvoiceBalance
		var amount, allocated string
		if err := rows.Scan(&invoice.ID, &invoice.Period, &amount, &allocated); err != nil {
			return nil, err
		}
		total, err := ParseAmountCents(amount)
		if err != nil {
			return nil, err
		}
		paid, err := ParseAmountCents(allocated)
		if err != nil {
			return nil, err
		}
		invoice.Remaining = total - paid
		invoices = append(invoices, invoice)
	}
	return invoices, rows.Err()
}

func ParseAmountCents(value string) (int64, error) {
	value = strings.TrimSpace(value)
	parts := strings.Split(value, ".")
	if len(parts) > 2 || parts[0] == "" {
		return 0, errors.New("invalid amount")
	}
	whole, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil || whole < 0 || whole > 9999999999 {
		return 0, errors.New("invalid amount")
	}
	fraction := "00"
	if len(parts) == 2 {
		if len(parts[1]) == 0 || len(parts[1]) > 2 {
			return 0, errors.New("invalid amount")
		}
		fraction = parts[1]
		if len(fraction) == 1 {
			fraction += "0"
		}
	}
	cents, err := strconv.ParseInt(fraction, 10, 64)
	if err != nil {
		return 0, errors.New("invalid amount")
	}
	return whole*100 + cents, nil
}

func amountDecimal(cents int64) string {
	return fmt.Sprintf("%d.%02d", cents/100, cents%100)
}

func isFinanceAdmin(actor FinanceActor) bool {
	return actor.Role == "system_admin" || actor.Role == "admin"
}

func unitScope(actor FinanceActor) string {
	if isFinanceAdmin(actor) {
		return ""
	}
	return " AND fi.owner_id = $1"
}

func unitScopeArgs(actor FinanceActor) []any {
	if isFinanceAdmin(actor) {
		return nil
	}
	return []any{actor.ID}
}

func leaseScope(actor FinanceActor) string {
	if isFinanceAdmin(actor) {
		return ""
	}
	return " AND l.provider_id = $2"
}

func leaseScopeArgs(actor FinanceActor) []any {
	if isFinanceAdmin(actor) {
		return nil
	}
	return []any{actor.ID}
}

func leaseListScope(actor FinanceActor) string {
	if isFinanceAdmin(actor) {
		return ""
	}
	return " AND l.provider_id = $1"
}

func leaseListScopeArgs(actor FinanceActor) []any {
	if isFinanceAdmin(actor) {
		return nil
	}
	return []any{actor.ID}
}

func paymentScope(actor FinanceActor) string {
	if isFinanceAdmin(actor) {
		return ""
	}
	return " AND p.provider_id = $1"
}

func paymentScopeArgs(actor FinanceActor) []any {
	if isFinanceAdmin(actor) {
		return nil
	}
	return []any{actor.ID}
}
