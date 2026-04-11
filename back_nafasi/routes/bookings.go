package routes

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

type BookingService struct {
	db *sql.DB
}

func NewBookingService(db *sql.DB) *BookingService {
	return &BookingService{db: db}
}

type Space struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Location    string  `json:"location"`
	Capacity    int     `json:"capacity"`
	PricePerDay float64 `json:"price_per_day"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
}

type Booking struct {
	ID        string  `json:"id"`
	SpaceID   string  `json:"space_id"`
	GuestName string  `json:"guest_name"`
	StartDate string  `json:"start_date"`
	EndDate   string  `json:"end_date"`
	Status    string  `json:"status"`
	Total     float64 `json:"total"`
	CreatedAt string  `json:"created_at"`
}

type Earning struct {
	ID        string  `json:"id"`
	SpaceID   string  `json:"space_id"`
	BookingID string  `json:"booking_id"`
	Amount    float64 `json:"amount"`
	Period    string  `json:"period"`
	CreatedAt string  `json:"created_at"`
}

func (s *BookingService) HandleGetSpaces(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, location, capacity, price_per_day, status, created_at 
		FROM spaces 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch spaces")
		return
	}
	defer rows.Close()

	var spaces []Space
	for rows.Next() {
		var s Space
		if err := rows.Scan(&s.ID, &s.Name, &s.Location, &s.Capacity, &s.PricePerDay, &s.Status, &s.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		spaces = append(spaces, s)
	}

	respondJSON(w, http.StatusOK, spaces)
}

func (s *BookingService) HandleGetBookings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, space_id, guest_name, start_date, end_date, status, total, created_at 
		FROM bookings 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch bookings")
		return
	}
	defer rows.Close()

	var bookings []Booking
	for rows.Next() {
		var b Booking
		if err := rows.Scan(&b.ID, &b.SpaceID, &b.GuestName, &b.StartDate, &b.EndDate, &b.Status, &b.Total, &b.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		bookings = append(bookings, b)
	}

	respondJSON(w, http.StatusOK, bookings)
}

func (s *BookingService) HandleGetEarnings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, space_id, booking_id, amount, period, created_at 
		FROM earnings 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch earnings")
		return
	}
	defer rows.Close()

	var earnings []Earning
	for rows.Next() {
		var e Earning
		if err := rows.Scan(&e.ID, &e.SpaceID, &e.BookingID, &e.Amount, &e.Period, &e.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		earnings = append(earnings, e)
	}

	respondJSON(w, http.StatusOK, earnings)
}

// Create handlers
func (s *BookingService) HandleCreateSpace(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string  `json:"name"`
		Location    string  `json:"location"`
		Capacity    int     `json:"capacity"`
		PricePerDay float64 `json:"price_per_day"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO spaces (name, location, capacity, price_per_day, status) 
		VALUES ($1, $2, $3, $4, 'available') 
		RETURNING id
	`, req.Name, req.Location, req.Capacity, req.PricePerDay).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create space")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "space created"})
}

func (s *BookingService) HandleCreateBooking(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SpaceID   string  `json:"space_id"`
		GuestName string  `json:"guest_name"`
		StartDate string  `json:"start_date"`
		EndDate   string  `json:"end_date"`
		Total     float64 `json:"total"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO bookings (space_id, guest_name, start_date, end_date, status, total) 
		VALUES ($1, $2, $3, $4, 'confirmed', $5) 
		RETURNING id
	`, req.SpaceID, req.GuestName, req.StartDate, req.EndDate, req.Total).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create booking")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "booking created"})
}

func (s *BookingService) HandleCreateEarning(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SpaceID   string  `json:"space_id"`
		BookingID string  `json:"booking_id"`
		Amount    float64 `json:"amount"`
		Period    string  `json:"period"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO earnings (space_id, booking_id, amount, period) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id
	`, req.SpaceID, req.BookingID, req.Amount, req.Period).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create earning")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "earning recorded"})
}

// Delete handlers
func (s *BookingService) HandleDeleteSpace(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id parameter required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM spaces WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete space")
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		respondError(w, http.StatusNotFound, "space not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "space deleted"})
}

func (s *BookingService) HandleDeleteBooking(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id parameter required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM bookings WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete booking")
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		respondError(w, http.StatusNotFound, "booking not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "booking deleted"})
}

func (s *BookingService) HandleDeleteEarning(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "id parameter required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, "DELETE FROM earnings WHERE id = $1", id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete earning")
		return
	}

	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		respondError(w, http.StatusNotFound, "earning not found")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "earning deleted"})
}
