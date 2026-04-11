package routes

import (
	"database/sql"
	"net/http"
)

func Register(mux *http.ServeMux, db *sql.DB) {
	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Auth routes
	auth := NewAuthService(db)
	mux.HandleFunc("POST /auth/register", auth.HandleRegister)
	mux.HandleFunc("POST /auth/login", auth.HandleLogin)
	mux.HandleFunc("GET /auth/me", auth.HandleMe)

	// Rental routes
	rental := NewRentalService(db)
	mux.HandleFunc("GET /api/rentals/properties", rental.HandleGetProperties)
	mux.HandleFunc("POST /api/rentals/properties", rental.HandleCreateProperty)
	mux.HandleFunc("GET /api/rentals/tenants", rental.HandleGetTenants)
	mux.HandleFunc("POST /api/rentals/tenants", rental.HandleCreateTenant)
	mux.HandleFunc("GET /api/rentals/payments", rental.HandleGetPayments)
	mux.HandleFunc("POST /api/rentals/payments", rental.HandleCreatePayment)
	mux.HandleFunc("GET /api/rentals/maintenance", rental.HandleGetMaintenance)
	mux.HandleFunc("POST /api/rentals/maintenance", rental.HandleCreateMaintenance)

	// Inventory routes
	inventory := NewInventoryService(db)
	mux.HandleFunc("GET /api/inventory/warehouses", inventory.HandleGetWarehouses)
	mux.HandleFunc("POST /api/inventory/warehouses", inventory.HandleCreateWarehouse)
	mux.HandleFunc("GET /api/inventory/products", inventory.HandleGetProducts)
	mux.HandleFunc("POST /api/inventory/products", inventory.HandleCreateProduct)
	mux.HandleFunc("GET /api/inventory/movements", inventory.HandleGetMovements)
	mux.HandleFunc("POST /api/inventory/movements", inventory.HandleCreateMovement)

	// Booking routes
	booking := NewBookingService(db)
	mux.HandleFunc("GET /api/bookings/spaces", booking.HandleGetSpaces)
	mux.HandleFunc("POST /api/bookings/spaces", booking.HandleCreateSpace)
	mux.HandleFunc("GET /api/bookings/bookings", booking.HandleGetBookings)
	mux.HandleFunc("POST /api/bookings/bookings", booking.HandleCreateBooking)
	mux.HandleFunc("GET /api/bookings/earnings", booking.HandleGetEarnings)
	mux.HandleFunc("POST /api/bookings/earnings", booking.HandleCreateEarning)

	// Notification routes
	notification := NewNotificationService(db)
	mux.HandleFunc("GET /api/notifications", notification.HandleGetNotifications)
	mux.HandleFunc("PUT /api/notifications/read", notification.HandleMarkAsRead)
}
