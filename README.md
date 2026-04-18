# Nafasi

A comprehensive multi-service platform for managing rental properties, inventory, bookings, and administrative operations.

## Overview

Nafasi is a full-stack application built with:
- **Frontend**: Next.js 16+ with TypeScript
- **Backend**: Go with RESTful API
- **Features**: Multi-context service management, role-based access control, real-time notifications

## Services

- **Rental**: Property management, tenant management, payments, and maintenance tracking
- **Inventory**: Product management, warehouse operations, and movement tracking
- **Spaces**: Booking management, calendar scheduling, and earnings tracking
- **Admin**: System administration, payment processing, and support tickets

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Go 1.20+
- Database (check backend configuration)

### Installation

1. **Frontend setup**:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

2. **Backend setup**:
```bash
cd back_nafasi
go mod download
go run .
```
Backend runs on `http://localhost:8080`

## Project Structure

```
.
├── app/                    # Next.js frontend
│   ├── (auth)/             # Authentication pages (login, register)
│   ├── components/         # Reusable React components
│   ├── dashboard/          # Dashboard pages
│   ├── rentals/            # Rental management
│   ├── inventory/          # Inventory management
│   ├── bookings/           # Booking management
│   ├── administrator/      # Admin panel
│   └── lib/                # Utilities and helpers
├── back_nafasi/            # Go backend
│   ├── routes/             # API routes
│   ├── middleware.go       # Request middleware
│   └── main.go             # Entry point
└── public/                 # Static assets
```

## Development

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend Commands
```bash
go run .         # Start development server
go build         # Build binary
go test ./...    # Run tests
```

## Architecture

- **Authentication**: Session-based with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **API**: RESTful with standardized error handling
- **State Management**: Local session storage with context switching

## License

See LICENSE file for details.
