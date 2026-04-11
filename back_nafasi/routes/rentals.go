package routes

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

type RentalService struct {
	db *sql.DB
}

func NewRentalService(db *sql.DB) *RentalService {
	return &RentalService{db: db}
}

// Property types
type Property struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Address   string `json:"address"`
	Units     int    `json:"units"`
	Occupied  int    `json:"occupied"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type Tenant struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	PropertyID string `json:"property_id"`
	CreatedAt  string `json:"created_at"`
}

type Payment struct {
	ID        string  `json:"id"`
	TenantID  string  `json:"tenant_id"`
	Amount    float64 `json:"amount"`
	Status    string  `json:"status"`
	DueDate   string  `json:"due_date"`
	PaidDate  string  `json:"paid_date"`
	CreatedAt string  `json:"created_at"`
}

type MaintenanceRequest struct {
	ID          string `json:"id"`
	PropertyID  string `json:"property_id"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// Handlers
func (s *RentalService) HandleGetProperties(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, address, units, occupied, created_at, updated_at 
		FROM properties 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch properties")
		return
	}
	defer rows.Close()

	var properties []Property
	for rows.Next() {
		var p Property
		if err := rows.Scan(&p.ID, &p.Name, &p.Address, &p.Units, &p.Occupied, &p.CreatedAt, &p.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		properties = append(properties, p)
	}

	respondJSON(w, http.StatusOK, properties)
}

func (s *RentalService) HandleGetTenants(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, email, phone, property_id, created_at 
		FROM tenants 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch tenants")
		return
	}
	defer rows.Close()

	var tenants []Tenant
	for rows.Next() {
		var t Tenant
		if err := rows.Scan(&t.ID, &t.Name, &t.Email, &t.Phone, &t.PropertyID, &t.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		tenants = append(tenants, t)
	}

	respondJSON(w, http.StatusOK, tenants)
}

func (s *RentalService) HandleGetPayments(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, tenant_id, amount, status, due_date, paid_date, created_at 
		FROM payments 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch payments")
		return
	}
	defer rows.Close()

	var payments []Payment
	for rows.Next() {
		var p Payment
		if err := rows.Scan(&p.ID, &p.TenantID, &p.Amount, &p.Status, &p.DueDate, &p.PaidDate, &p.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		payments = append(payments, p)
	}

	respondJSON(w, http.StatusOK, payments)
}

func (s *RentalService) HandleGetMaintenance(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, property_id, description, priority, status, created_at, updated_at 
		FROM maintenance_requests 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch maintenance requests")
		return
	}
	defer rows.Close()

	var requests []MaintenanceRequest
	for rows.Next() {
		var mr MaintenanceRequest
		if err := rows.Scan(&mr.ID, &mr.PropertyID, &mr.Description, &mr.Priority, &mr.Status, &mr.CreatedAt, &mr.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		requests = append(requests, mr)
	}

	respondJSON(w, http.StatusOK, requests)
}

// Create handlers
func (s *RentalService) HandleCreateProperty(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		Address string `json:"address"`
		Units   int    `json:"units"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO properties (name, address, units) 
		VALUES ($1, $2, $3) 
		RETURNING id
	`, req.Name, req.Address, req.Units).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create property")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "property created"})
}

func (s *RentalService) HandleCreateTenant(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name       string `json:"name"`
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		PropertyID string `json:"property_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO tenants (name, email, phone, property_id) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id
	`, req.Name, req.Email, req.Phone, req.PropertyID).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create tenant")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "tenant created"})
}

func (s *RentalService) HandleCreatePayment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TenantID string  `json:"tenant_id"`
		Amount   float64 `json:"amount"`
		DueDate  string  `json:"due_date"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO payments (tenant_id, amount, status, due_date) 
		VALUES ($1, $2, 'pending', $3) 
		RETURNING id
	`, req.TenantID, req.Amount, req.DueDate).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create payment")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "payment created"})
}

func (s *RentalService) HandleCreateMaintenance(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PropertyID  string `json:"property_id"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	if req.Priority == "" {
		req.Priority = "normal"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO maintenance_requests (property_id, description, priority, status) 
		VALUES ($1, $2, $3, 'open') 
		RETURNING id
	`, req.PropertyID, req.Description, req.Priority).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create maintenance request")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "maintenance request created"})
}

// Delete handlers
func (s *RentalService) HandleDeleteProperty(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM properties WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete property")
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "property not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "property deleted"})
}

func (s *RentalService) HandleDeleteTenant(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM tenants WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete tenant")
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "tenant not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "tenant deleted"})
}

func (s *RentalService) HandleDeletePayment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM payments WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete payment")
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "payment not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "payment deleted"})
}

func (s *RentalService) HandleDeleteMaintenance(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM maintenance_requests WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete maintenance request")
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "maintenance request not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "maintenance request deleted"})
}
