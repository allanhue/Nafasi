package routes

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

type InventoryService struct {
	db *sql.DB
}

func NewInventoryService(db *sql.DB) *InventoryService {
	return &InventoryService{db: db}
}

type Warehouse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Location  string `json:"location"`
	Capacity  int    `json:"capacity"`
	Used      int    `json:"used"`
	CreatedAt string `json:"created_at"`
}

type Product struct {
	ID          string  `json:"id"`
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	WarehouseID string  `json:"warehouse_id"`
	CreatedAt   string  `json:"created_at"`
}

type Movement struct {
	ID            string `json:"id"`
	ProductID     string `json:"product_id"`
	FromWarehouse string `json:"from_warehouse"`
	ToWarehouse   string `json:"to_warehouse"`
	Quantity      int    `json:"quantity"`
	MovementType  string `json:"movement_type"`
	CreatedAt     string `json:"created_at"`
}

func (s *InventoryService) HandleGetWarehouses(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, location, capacity, used, created_at 
		FROM warehouses 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch warehouses")
		return
	}
	defer rows.Close()

	var warehouses []Warehouse
	for rows.Next() {
		var w Warehouse
		if err := rows.Scan(&w.ID, &w.Name, &w.Location, &w.Capacity, &w.Used, &w.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		warehouses = append(warehouses, w)
	}

	respondJSON(w, http.StatusOK, warehouses)
}

func (s *InventoryService) HandleGetProducts(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, sku, name, quantity, unit_price, warehouse_id, created_at 
		FROM products 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch products")
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Quantity, &p.UnitPrice, &p.WarehouseID, &p.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		products = append(products, p)
	}

	respondJSON(w, http.StatusOK, products)
}

func (s *InventoryService) HandleGetMovements(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, product_id, from_warehouse, to_warehouse, quantity, movement_type, created_at 
		FROM movements 
		ORDER BY created_at DESC
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch movements")
		return
	}
	defer rows.Close()

	var movements []Movement
	for rows.Next() {
		var m Movement
		if err := rows.Scan(&m.ID, &m.ProductID, &m.FromWarehouse, &m.ToWarehouse, &m.Quantity, &m.MovementType, &m.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "scanning error")
			return
		}
		movements = append(movements, m)
	}

	respondJSON(w, http.StatusOK, movements)
}

// Create handlers
func (s *InventoryService) HandleCreateWarehouse(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Location string `json:"location"`
		Capacity int    `json:"capacity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO warehouses (name, location, capacity) 
		VALUES ($1, $2, $3) 
		RETURNING id
	`, req.Name, req.Location, req.Capacity).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create warehouse")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "warehouse created"})
}

func (s *InventoryService) HandleCreateProduct(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SKU         string  `json:"sku"`
		Name        string  `json:"name"`
		Quantity    int     `json:"quantity"`
		UnitPrice   float64 `json:"unit_price"`
		WarehouseID string  `json:"warehouse_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO products (sku, name, quantity, unit_price, warehouse_id) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id
	`, req.SKU, req.Name, req.Quantity, req.UnitPrice, req.WarehouseID).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create product")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "product created"})
}

func (s *InventoryService) HandleCreateMovement(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProductID     string `json:"product_id"`
		FromWarehouse string `json:"from_warehouse"`
		ToWarehouse   string `json:"to_warehouse"`
		Quantity      int    `json:"quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var id string
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO movements (product_id, from_warehouse, to_warehouse, quantity, movement_type) 
		VALUES ($1, $2, $3, $4, 'transfer') 
		RETURNING id
	`, req.ProductID, req.FromWarehouse, req.ToWarehouse, req.Quantity).Scan(&id)

	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create movement")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"id": id, "message": "movement created"})
}
