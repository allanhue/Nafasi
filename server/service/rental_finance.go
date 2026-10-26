package service

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"nafasi_new/back_nafasi/model"
)

type FinanceError struct {
	Kind    string
	Message string
}

func (e *FinanceError) Error() string {
	return e.Message
}

type RentalFinance struct {
	repository *model.RentalFinance
}

func NewRentalFinance(repository *model.RentalFinance) *RentalFinance {
	return &RentalFinance{repository: repository}
}

func (s *RentalFinance) Workspace(ctx context.Context, actor model.FinanceActor) (model.RentalFinanceWorkspace, error) {
	workspace, err := s.repository.Workspace(ctx, actor)
	if err != nil {
		return workspace, err
	}
	for index := range workspace.Leases {
		lease := &workspace.Leases[index]
		switch {
		case lease.InvoiceCount == 0:
			lease.Status = "No invoices"
		default:
			balance, err := model.ParseAmountCents(lease.Balance)
			if err != nil {
				return workspace, err
			}
			if balance <= 0 {
				lease.Status = "Paid"
				continue
			}
			lease.Status = "Partially paid"
			invoiced, err := model.ParseAmountCents(lease.InvoicedTotal)
			if err != nil {
				return workspace, err
			}
			if invoiced == balance {
				lease.Status = "Due"
			}
		}
	}
	bucketCents := map[string]int64{
		"1–30 days": 0, "31–60 days": 0, "61–90 days": 0, "90+ days": 0,
	}
	for index := range workspace.Arrears {
		item := &workspace.Arrears[index]
		item.Bucket = arrearsBucket(item.DaysOverdue)
		cents, err := model.ParseAmountCents(item.Balance)
		if err != nil {
			return workspace, err
		}
		bucketCents[item.Bucket] += cents
	}
	workspace.ArrearsBuckets = make(map[string]string, len(bucketCents))
	for label, cents := range bucketCents {
		workspace.ArrearsBuckets[label] = fmt.Sprintf("%d.%02d", cents/100, cents%100)
	}
	return workspace, nil
}

func (s *RentalFinance) CreateLease(ctx context.Context, actor model.FinanceActor, input model.CreateRentalLeaseInput) error {
	input.TenantName = strings.TrimSpace(input.TenantName)
	input.TenantEmail = strings.ToLower(strings.TrimSpace(input.TenantEmail))
	input.TenantPhone = strings.TrimSpace(input.TenantPhone)
	rentCents, amountErr := model.ParseAmountCents(input.MonthlyRent)
	startDate, dateErr := time.Parse("2006-01-02", input.StartDate)
	if input.UnitID <= 0 || (input.TenantID <= 0 && input.TenantName == "") ||
		amountErr != nil || rentCents <= 0 || input.DueDay < 1 || input.DueDay > 31 || dateErr != nil {
		return &FinanceError{Kind: "validation", Message: "A unit, tenant name or existing tenant, positive monthly rent, due day from 1 to 31, and valid start date are required"}
	}
	if input.TenantEmail != "" {
		parsedEmail, err := mail.ParseAddress(input.TenantEmail)
		if err != nil || parsedEmail.Address != input.TenantEmail {
			return &FinanceError{Kind: "validation", Message: "Enter a valid tenant email address"}
		}
	}
	return mapFinancePersistenceError(s.repository.CreateLease(ctx, actor, input, rentCents, startDate))
}

func (s *RentalFinance) GenerateInvoices(ctx context.Context, actor model.FinanceActor, leaseID int64) (int, error) {
	if leaseID <= 0 {
		return 0, &FinanceError{Kind: "validation", Message: "A valid lease is required"}
	}
	startDate, dueDay, err := s.repository.InvoiceSchedule(ctx, actor, leaseID)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, &FinanceError{Kind: "not_found", Message: "Active tenancy not found or not accessible"}
	}
	if err != nil {
		return 0, err
	}
	today := time.Now().In(time.FixedZone("EAT", 3*60*60))
	month := time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, time.UTC)
	currentMonth := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, time.UTC)
	todayDate := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)
	dates := []model.RentInvoiceDate{}
	for !month.After(currentMonth) {
		due := monthDueDate(month, dueDay)
		if !due.Before(startDate) && !due.After(todayDate) {
			dates = append(dates, model.RentInvoiceDate{PeriodStart: month, DueDate: due})
		}
		month = month.AddDate(0, 1, 0)
	}
	created, err := s.repository.CreateInvoices(ctx, actor, leaseID, dates)
	return created, mapFinancePersistenceError(err)
}

func (s *RentalFinance) RecordPayment(ctx context.Context, actor model.FinanceActor, input model.RecordRentPaymentInput) (model.RentReceipt, error) {
	input.Method = strings.ToLower(strings.TrimSpace(input.Method))
	input.Reference = strings.TrimSpace(input.Reference)
	input.Notes = strings.TrimSpace(input.Notes)
	input.IdempotencyKey = strings.TrimSpace(input.IdempotencyKey)
	amount, amountErr := model.ParseAmountCents(input.Amount)
	paidAt, dateErr := time.Parse("2006-01-02", input.PaymentDate)
	today := time.Now().In(time.FixedZone("EAT", 3*60*60)).Format("2006-01-02")
	if input.LeaseID <= 0 || amountErr != nil || amount <= 0 ||
		(input.Method != "mpesa" && input.Method != "cash" && input.Method != "bank") ||
		dateErr != nil || input.PaymentDate > today ||
		input.IdempotencyKey == "" || len(input.IdempotencyKey) > 100 ||
		len(input.Reference) > 120 || len(input.Notes) > 1000 {
		return model.RentReceipt{}, &FinanceError{Kind: "validation", Message: "Enter a valid tenancy, positive amount, payment method, date, and payment request key"}
	}
	receiptNumber, err := newReceiptNumber(paidAt)
	if err != nil {
		return model.RentReceipt{}, err
	}
	receipt, err := s.repository.RecordPayment(
		ctx, actor, input, receiptNumber, amount, paidAt, allocatePaymentForRecording,
	)
	return receipt, mapFinancePersistenceError(err)
}

func allocatePaymentForRecording(amount int64, invoices []model.RentInvoiceBalance) ([]model.PaymentAllocation, int64, error) {
	allocations, balance, err := allocatePayment(amount, invoices)
	if err != nil {
		return nil, 0, &FinanceError{Kind: "validation", Message: err.Error()}
	}
	return allocations, balance, nil
}

func mapFinancePersistenceError(err error) error {
	var persistenceError *model.FinancePersistenceError
	if errors.As(err, &persistenceError) {
		return &FinanceError{Kind: persistenceError.Kind, Message: persistenceError.Message}
	}
	return err
}

func monthDueDate(month time.Time, day int) time.Time {
	lastDay := month.AddDate(0, 1, 0).AddDate(0, 0, -1).Day()
	if day > lastDay {
		day = lastDay
	}
	return time.Date(month.Year(), month.Month(), day, 0, 0, 0, 0, time.UTC)
}

func newReceiptNumber(paidAt time.Time) (string, error) {
	random := make([]byte, 8)
	if _, err := rand.Read(random); err != nil {
		return "", err
	}
	return fmt.Sprintf("NF-%s-%s", paidAt.Format("2006"), strings.ToUpper(hex.EncodeToString(random))), nil
}

func arrearsBucket(days int) string {
	switch {
	case days <= 30:
		return "1–30 days"
	case days <= 60:
		return "31–60 days"
	case days <= 90:
		return "61–90 days"
	default:
		return "90+ days"
	}
}

func allocatePayment(amount int64, invoices []model.RentInvoiceBalance) ([]model.PaymentAllocation, int64, error) {
	if amount <= 0 {
		return nil, 0, errors.New("Payment amount must be greater than zero")
	}
	remainingTotal := int64(0)
	for _, invoice := range invoices {
		if invoice.Remaining < 0 {
			return nil, 0, errors.New("An invoice has an invalid negative balance")
		}
		remainingTotal += invoice.Remaining
	}
	if remainingTotal == 0 {
		return nil, 0, errors.New("There are no unpaid rent invoices. Generate due invoices before recording payment.")
	}
	if amount > remainingTotal {
		return nil, 0, errors.New("Payment exceeds the outstanding rent balance. Tenant credit is not enabled.")
	}
	remainingPayment := amount
	allocations := []model.PaymentAllocation{}
	for _, invoice := range invoices {
		if invoice.Remaining == 0 {
			continue
		}
		allocated := invoice.Remaining
		if allocated > remainingPayment {
			allocated = remainingPayment
		}
		allocations = append(allocations, model.PaymentAllocation{
			InvoiceID: invoice.ID, Period: invoice.Period, Amount: allocated,
		})
		remainingPayment -= allocated
		if remainingPayment == 0 {
			break
		}
	}
	return allocations, remainingTotal - amount, nil
}
