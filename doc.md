# Nafasi Limited - Professional Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Core Modules](#core-modules)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Technical Stack](#technical-stack)
7. [Payment Methods](#payment-methods)
8. [Calendar & Scheduling](#calendar--scheduling)
9. [API Reference](#api-reference)
10. [Getting Started](#getting-started)
11. [Support & Help](#support--help)

---

## Overview

**Nafasi Limited** is a comprehensive property and event management platform designed to streamline operations across three core business areas:

- **Rentals**: Manage residential and commercial property listings, viewings, and leases
- **Warehouses**: Handle warehouse inventory, logistics, and storage requests
- **Event Spaces**: Coordinate bookings, events, and ticketing for event venues

The platform provides an integrated workspace for managing all aspects of property operations, from initial listing to tenant management and reporting.

### Key Objectives
- Centralized management of multiple property types
- Real-time calendar and event scheduling
- Comprehensive reporting and analytics
- Secure authentication and role-based access control
- Mobile-friendly responsive design
- Multi-language support (English & Swahili)

---

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14+ (React with TypeScript)
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: React Hooks
- **Client-side Routing**: Next.js App Router

### Backend Architecture
- **Language**: Go
- **Database**: PostgreSQL (assumed from structure)
- **API Design**: RESTful JSON API
- **Authentication**: JWT Bearer tokens

### Application Structure

```
nafasi_new/
├── app/
│   ├── components/        # Reusable React components
│   ├── lib/               # Utility functions and configurations
│   ├── [feature]/         # Feature-specific pages (rentals, warehouses, spaces, etc.)
│   └── page.tsx           # Main pages
├── back_nafasi/           # Go backend server
│   ├── routes/            # API endpoints
│   ├── main.go            # Server entry point
│   └── db.go              # Database configuration
└── public/                # Static assets

```

---

## Features

### 1. **Unified Dashboard**
- Overview of all properties, warehouses, and events
- Quick statistics and key metrics
- Recent activity feed
- Performance indicators

### 2. **Interactive Calendar**
- Month view with day-by-day events
- Click any day to add events/schedules
- Event types: viewing, visit, event, reminder, reference
- Color-coded events by category
- Maintenance notifications

### 3. **Property Management**
- **Rentals**: Property listings, tenant management, lease agreements
- **Warehouses**: Storage requests, logistics coordination
- **Event Spaces**: Venue bookings, event scheduling

### 4. **User Workspace**
- Personalized interface per user
- Theme customization (light/dark/auto)
- Language preferences (English/Swahili)
- Email notification settings

### 5. **Authentication & Security**
- Secure JWT-based authentication
- Role-based access control (RBAC)
- Account management and sign-out functionality

### 6. **Reporting & Analytics**
- Feature-specific reports
- Data visualization
- Export capabilities (when enabled)

---

## Core Modules

### Rentals Module (`/rentals`)
Manage residential and commercial property rentals.

**Pages:**
- `properties-listings/` - Browse and manage property listings
- `applications/` - Handle rental applications
- `leases/` - Manage lease agreements
- `viewing-requests/` - Track property viewings
- `reports/` - Generate rental reports

**Key Operations:**
- Create new property listings with details
- Process rental applications
- Track viewing requests
- Generate lease agreements
- Create and manage rental reports

---

### Warehouses Module (`/warehouses`)
Handle warehouse and storage operations.

**Pages:**
- `warehouse-listings/` - Browse warehouse inventory
- `storage-requests/` - Manage storage requests
- `contracts/` - Handle warehouse contracts
- `logistics-support/` - Coordinate logistics
- `reports/` - Generate warehouse reports

**Key Operations:**
- List available warehouses
- Process storage requests
- Create storage contracts
- Track logistics operations
- Generate warehouse reports

---

### Event Spaces Module (`/spaces`)
Manage event venues and bookings.

**Pages:**
- `blogs/` - Event space blog and information
- `bookings/` - Manage event bookings
- `events/` - List and manage events
- `tickets/` - Handle ticketing
- `reports/` - Generate event reports

**Key Operations:**
- Create event space listings
- Process event bookings
- Manage ticketing system
- Track events and attendance
- Generate event reports

---

## User Roles & Permissions

### System Roles

#### 1. **System Admin**
- Full system access
- User management
- System-wide settings
- Maintenance notifications

#### 2. **Admin**
- Organization-level management
- Feature management
- Report generation
- Maintenance notifications

#### 3. **Manager**
- Feature-specific management
- Report viewing
- User assistance

#### 4. **User**
- Access assigned features
- Create and manage own data
- View calendars and schedules

---

## Technical Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js 14+ |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | React Hooks |
| Icons | SVG + Emojis |
| Themes | Custom CSS Variables |

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Go |
| Database | PostgreSQL |
| API Style | RESTful |
| Authentication | JWT |
| Port | 5000 (configurable) |

### Environment Variables
```env
API_BASE_URL=http://localhost:5000
```

---

## Payment Methods

Nafasi supports three primary payment methods for transactions:

### 1. **M-Pesa**
- Provider: Safaricom
- Type: Mobile money transfer
- Ideal for: Individual users, quick payments
- Status: Available for setup

### 2. **Airtel Money**
- Provider: Airtel
- Type: Mobile money transfer
- Ideal for: Airtel subscribers
- Status: Available for setup

### 3. **Card**
- Type: Credit/Debit card
- Supported Cards: Visa, Mastercard
- Ideal for: Enterprise payments
- Status: Available for setup

**Payment Integration Points:**
- User account setup
- Transaction processing
- Rent and lease payments
- Service charges
- Booking confirmations

---

## Calendar & Scheduling

### Features

#### Interactive Calendar
- Full month view with navigation
- Day selection for event creation
- Real-time event display
- Multiple event types per day

#### Event Types
| Type | Use Case |
|------|----------|
| Reference | General information |
| Viewing | Property viewing appointment |
| Visit | Property or warehouse visit |
| Event | Event space booking |
| Reminder | Important reminder |

#### Event Details
- **Title**: Event name
- **Feature**: Associated module (rentals, warehouses, spaces, account)
- **Type**: Event classification
- **Start/End Time**: Event duration
- **Location**: Event location
- **Notes**: Description and additional details
- **Reminder**: Notification time

#### Maintenance Notifications
Admins can schedule system maintenance notifications:
- Scheduled maintenance
- Updated notices
- Cancelled maintenance
- Completed maintenance

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All requests require JWT token in header:
```
Authorization: Bearer {token}
```

### Core Endpoints

#### Calendar
```
GET    /api/calendar              # Get user's calendar items
POST   /api/calendar              # Create calendar item
GET    /api/calendar/maintenance  # Get maintenance notices (admin only)
POST   /api/calendar/maintenance  # Create maintenance notice (admin only)
PUT    /api/calendar/maintenance/{id}  # Update maintenance notice (admin only)
```

#### Rentals
```
GET    /api/rentals               # Get rental listings
POST   /api/rentals               # Create rental listing
GET    /api/rentals/{id}          # Get rental details
PUT    /api/rentals/{id}          # Update rental
DELETE /api/rentals/{id}          # Delete rental
```

#### Warehouses
```
GET    /api/warehouses            # Get warehouse listings
POST   /api/warehouses            # Create warehouse listing
GET    /api/warehouses/{id}       # Get warehouse details
PUT    /api/warehouses/{id}       # Update warehouse
DELETE /api/warehouses/{id}       # Delete warehouse
```

#### Event Spaces
```
GET    /api/spaces                # Get event space listings
POST   /api/spaces                # Create event space listing
GET    /api/spaces/{id}           # Get event space details
PUT    /api/spaces/{id}           # Update event space
DELETE /api/spaces/{id}           # Delete event space
```

### Response Format
All responses follow standard format:
```json
{
  "status": "success|error",
  "data": {},
  "message": "Operation description",
  "error": "Error message (if applicable)"
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Go 1.19+
- PostgreSQL 12+
- npm or yarn

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env.local`:
   ```env
   API_BASE_URL=http://localhost:5000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`

### Backend Setup

1. **Install Go dependencies:**
   ```bash
   cd back_nafasi
   go mod download
   ```

2. **Configure database:**
   Update database connection in `db.go`

3. **Run server:**
   ```bash
   go run main.go
   ```
   Server runs on port 5000 by default

### First Steps
1. Sign up or log in
2. Complete workspace setup
3. Choose theme and language preferences
4. Add payment method
5. Navigate to dashboard to begin

---

## Support & Help

### Documentation Pages
- **Help Center**: `/help` - User guides and FAQs
- **Settings**: `/setup` - Account preferences and configuration
- **Dashboard**: `/dashboard` - System overview and analytics

### Contact Support
Users can access support from the Settings page or Help section. For technical issues, contact development team.

### Troubleshooting

#### Common Issues

**Issue:** Calendar events not showing
- **Solution**: Ensure user is logged in and calendar items are created from calendar page

**Issue:** Payment method not appearing
- **Solution**: Clear browser cache and reload page after setup

**Issue:** API connection failed
- **Solution**: Verify backend server is running and `API_BASE_URL` is correct

---

## Features Roadmap

### Upcoming Features
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app
- [ ] API documentation portal
- [ ] Advanced analytics dashboard
- [ ] Integration with external services
- [ ] Two-factor authentication
- [ ] Audit logging

---

## Version Information
- **Application Version**: 1.0.0
- **Frontend Framework**: Next.js 14+
- **Backend Framework**: Go
- **Last Updated**: June 2026

---

## License & Support
For licensing information and support requests, please contact Nafasi Limited directly.

---

**End of Documentation**

