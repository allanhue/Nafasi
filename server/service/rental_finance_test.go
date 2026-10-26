package service

import (
	"errors"
	"strings"
	"testing"
	"time"

	"nafasi_new/back_nafasi/model"
)

func TestAllocatePaymentUsesOldestInvoiceAndSupportsPartialPayment(t *testing.T) {
	invoices := []model.RentInvoiceBalance{
		{ID: 1, Period: "2026-01-01", Remaining: 2500000},
		{ID: 2, Period: "2026-02-01", Remaining: 2500000},
	}
	allocations, balance, err := allocatePayment(3000000, invoices)
	if err != nil {
		t.Fatalf("allocatePayment returned an error: %v", err)
	}
	if len(allocations) != 2 {
		t.Fatalf("expected two allocations, got %d", len(allocations))
	}
	if allocations[0].InvoiceID != 1 || allocations[0].Amount != 2500000 {
		t.Fatalf("oldest invoice was not paid first: %#v", allocations[0])
	}
	if allocations[1].InvoiceID != 2 || allocations[1].Amount != 500000 {
		t.Fatalf("partial second allocation was incorrect: %#v", allocations[1])
	}
	if balance != 2000000 {
		t.Fatalf("expected remaining balance 2000000 cents, got %d", balance)
	}
}

func TestMonthDueDateClampsToMonthEnd(t *testing.T) {
	month, err := time.Parse("2006-01-02", "2026-02-01")
	if err != nil {
		t.Fatal(err)
	}
	got := monthDueDate(month, 31)
	if got.Format("2006-01-02") != "2026-02-28" {
		t.Fatalf("due date = %s, want 2026-02-28", got.Format("2006-01-02"))
	}
}

func TestAllocatePaymentRejectsCreditAndNoOutstandingInvoices(t *testing.T) {
	tests := []struct {
		name     string
		amount   int64
		invoices []model.RentInvoiceBalance
		wantText string
	}{
		{
			name: "overpayment", amount: 10001,
			invoices: []model.RentInvoiceBalance{{ID: 1, Remaining: 10000}},
			wantText: "Tenant credit is not enabled",
		},
		{
			name: "no invoices", amount: 100,
			invoices: []model.RentInvoiceBalance{{ID: 1, Remaining: 0}},
			wantText: "no unpaid rent invoices",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, _, err := allocatePayment(test.amount, test.invoices)
			if err == nil || !strings.Contains(err.Error(), test.wantText) {
				t.Fatalf("expected error containing %q, got %v", test.wantText, err)
			}
		})
	}
}

func TestAllocatePaymentForRecordingMapsRuleFailuresToValidation(t *testing.T) {
	_, _, err := allocatePaymentForRecording(10001, []model.RentInvoiceBalance{
		{ID: 1, Remaining: 10000},
	})
	var financeErr *FinanceError
	if !errors.As(err, &financeErr) || financeErr.Kind != "validation" {
		t.Fatalf("expected validation FinanceError for overpayment, got %v", err)
	}
}

func TestMapFinancePersistenceError(t *testing.T) {
	err := mapFinancePersistenceError(&model.FinancePersistenceError{
		Kind: "conflict", Message: "duplicate payment",
	})
	var financeErr *FinanceError
	if !errors.As(err, &financeErr) || financeErr.Kind != "conflict" || financeErr.Message != "duplicate payment" {
		t.Fatalf("unexpected mapped finance error: %#v", err)
	}
}
