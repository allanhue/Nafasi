package routes

import (
	"encoding/json"
	"errors"
	"net/http"

	"nafasi_new/back_nafasi/model"
	"nafasi_new/back_nafasi/service"
)

type RentalFinanceHandler struct {
	finance *service.RentalFinance
}

func NewRentalFinanceHandler(finance *service.RentalFinance) *RentalFinanceHandler {
	return &RentalFinanceHandler{finance: finance}
}

func (h *RentalFinanceHandler) GetWorkspace(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	workspace, err := h.finance.Workspace(r.Context(), financeActor(user))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not load rental finance workspace")
		return
	}
	WriteJSON(w, http.StatusOK, workspace)
}

func (h *RentalFinanceHandler) CreateLease(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var req model.CreateRentalLeaseInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.finance.CreateLease(r.Context(), financeActor(user), req); err != nil {
		writeFinanceError(w, err, "Could not create tenancy")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{"message": "Tenancy created. Generate invoices to record rent."})
}

func (h *RentalFinanceHandler) GenerateInvoices(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var req struct {
		LeaseID int64 `json:"leaseId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	created, err := h.finance.GenerateInvoices(r.Context(), financeActor(user), req.LeaseID)
	if err != nil {
		writeFinanceError(w, err, "Could not generate rent invoices")
		return
	}
	WriteJSON(w, http.StatusOK, map[string]any{"created": created})
}

func (h *RentalFinanceHandler) RecordPayment(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	var req model.RecordRentPaymentInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	receipt, err := h.finance.RecordPayment(r.Context(), financeActor(user), req)
	if err != nil {
		writeFinanceError(w, err, "Could not record payment")
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]any{"receipt": receipt})
}

func financeActor(user User) model.FinanceActor {
	return model.FinanceActor{ID: user.ID, Name: user.Name, Role: user.Role}
}

func writeFinanceError(w http.ResponseWriter, err error, fallback string) {
	var financeErr *service.FinanceError
	if !errors.As(err, &financeErr) {
		writeError(w, http.StatusInternalServerError, fallback)
		return
	}
	switch financeErr.Kind {
	case "validation":
		writeError(w, http.StatusBadRequest, financeErr.Message)
	case "not_found":
		writeError(w, http.StatusNotFound, financeErr.Message)
	case "conflict":
		writeError(w, http.StatusConflict, financeErr.Message)
	default:
		writeError(w, http.StatusInternalServerError, fallback)
	}
}
