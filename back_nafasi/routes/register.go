package routes

import (
	"database/sql"
	"net/http"
)

func Register(mux *http.ServeMux, db *sql.DB) {
	// Health check to go functions  api
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Auth routes
	auth := NewAuthService(db)
	mux.HandleFunc("POST /auth/register", auth.HandleRegister)
	mux.HandleFunc("POST /auth/login", auth.HandleLogin)
	mux.HandleFunc("GET /auth/me", auth.HandleMe)
	mux.HandleFunc("POST /auth/logout", auth.HandleLogout)

	// Rental routes
	rental := NewRentalService(db)
	mux.HandleFunc("GET /api/rentals/properties", rental.HandleGetProperties)
	mux.HandleFunc("POST /api/rentals/properties", rental.HandleCreateProperty)
	mux.HandleFunc("DELETE /api/rentals/properties", rental.HandleDeleteProperty)
	mux.HandleFunc("GET /api/rentals/tenants", rental.HandleGetTenants)
	mux.HandleFunc("POST /api/rentals/tenants", rental.HandleCreateTenant)
	mux.HandleFunc("DELETE /api/rentals/tenants", rental.HandleDeleteTenant)
	mux.HandleFunc("GET /api/rentals/payments", rental.HandleGetPayments)
	mux.HandleFunc("POST /api/rentals/payments", rental.HandleCreatePayment)
	mux.HandleFunc("DELETE /api/rentals/payments", rental.HandleDeletePayment)
	mux.HandleFunc("GET /api/rentals/maintenance", rental.HandleGetMaintenance)
	mux.HandleFunc("POST /api/rentals/maintenance", rental.HandleCreateMaintenance)
	mux.HandleFunc("DELETE /api/rentals/maintenance", rental.HandleDeleteMaintenance)

	// Inventory routes
	inventory := NewInventoryService(db)
	mux.HandleFunc("GET /api/inventory/warehouses", inventory.HandleGetWarehouses)
	mux.HandleFunc("POST /api/inventory/warehouses", inventory.HandleCreateWarehouse)
	mux.HandleFunc("DELETE /api/inventory/warehouses", inventory.HandleDeleteWarehouse)
	mux.HandleFunc("GET /api/inventory/products", inventory.HandleGetProducts)
	mux.HandleFunc("POST /api/inventory/products", inventory.HandleCreateProduct)
	mux.HandleFunc("DELETE /api/inventory/products", inventory.HandleDeleteProduct)
	mux.HandleFunc("GET /api/inventory/movements", inventory.HandleGetMovements)
	mux.HandleFunc("POST /api/inventory/movements", inventory.HandleCreateMovement)
	mux.HandleFunc("DELETE /api/inventory/movements", inventory.HandleDeleteMovement)

	// Booking routes
	booking := NewBookingService(db)
	mux.HandleFunc("GET /api/bookings/spaces", booking.HandleGetSpaces)
	mux.HandleFunc("POST /api/bookings/spaces", booking.HandleCreateSpace)
	mux.HandleFunc("DELETE /api/bookings/spaces", booking.HandleDeleteSpace)
	mux.HandleFunc("GET /api/bookings/bookings", booking.HandleGetBookings)
	mux.HandleFunc("POST /api/bookings/bookings", booking.HandleCreateBooking)
	mux.HandleFunc("DELETE /api/bookings/bookings", booking.HandleDeleteBooking)
	mux.HandleFunc("GET /api/bookings/earnings", booking.HandleGetEarnings)
	mux.HandleFunc("POST /api/bookings/earnings", booking.HandleCreateEarning)
	mux.HandleFunc("DELETE /api/bookings/earnings", booking.HandleDeleteEarning)

	// Notification routes
	notification := NewNotificationService(db)
	mux.HandleFunc("GET /api/notifications", notification.HandleGetNotifications)
	mux.HandleFunc("PUT /api/notifications/read", notification.HandleMarkAsRead)
}
