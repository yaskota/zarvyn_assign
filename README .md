
# Secure Finance Data Processing API

A robust, production-ready backend for finance data, featuring secure authentication, role-based access, modular architecture, and analytics. Built with Node.js, React.Js, Express, MongoDB,becrypt.Js, JWT, CORS,.

## Features
- Modular, clean codebase (controllers, services, middleware, modules)
- Secure authentication (becrypt.Js, JWT)
- Role-based access control (ADMIN, ANALYST, VIEWER)
- Standardized error handling
- Financial record CRUD, analytics, and pagination

## Getting Started

### Prerequisites
- Node.js (22.17.1)
- MongoDB (Atlas)

### Setup
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` file:
   ```env
  PORT=8000
  MONGO_URI=mongodb+srv://yas:123@cluster0.h2p6q.mongodb.net/Bank_database
  JWT_SECRET=zarvyn_finance_secret_key_2026
  NODE_ENV=development
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The API will run at `http://localhost:8000` by default.

---

## API Reference

All endpoints are prefixed with `/api`. All authenticated requests require a JWT in the `Authorization: Bearer <JWT>` header.

### Auth

#### Register
`POST /api/auth/register`
- Registers a new user. Default role is VIEWER.
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "ADMIN" // optional
  }
  ```

#### Login
`POST /api/auth/login`
- Logs in a user and returns a JWT.
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "status": "success",
    "token": "<JWT>",
    "user": { "id": "...", "email": "...", "role": "..." },
    "timestamp": "..."
  }
  ```

---

### Users (ADMIN only)

All user management endpoints require ADMIN role.

- `GET /api/users` — List all users (supports `limit` and `offset` query params for pagination)
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user (email, role)
- `DELETE /api/users/:id` — Soft delete (deactivate) user

#### Example: List Users
```bash
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer <JWT>"
```

---

### Financial Records

All record endpoints require authentication. RBAC is enforced (ADMIN: full CRUD, ANALYST/VIEWER: read-only).

- `GET /api/records` — List all records (supports filtering by type, category, date range, and pagination)
- `GET /api/records/:id` — Get record by ID
- `POST /api/records` — Create a new record
- `PUT /api/records/:id` — Update a record
- `DELETE /api/records/:id` — Soft delete a record


#### Example: List Records with Filtering
```bash
curl -X GET "http://localhost:4000/api/records?type=INCOME&category=Salary&from=2024-04-01&to=2024-04-30&limit=10&offset=0" \
  -H "Authorization: Bearer <JWT>"
```

**Query Parameters:**
- `type` — Filter by record type (`INCOME` or `EXPENSE`)
- `category` — Filter by category (string)
- `from` — Start date (inclusive, ISO string or YYYY-MM-DD)
- `to` — End date (inclusive, ISO string or YYYY-MM-DD)
- `limit` — Pagination limit (default 20)
- `offset` — Pagination offset (default 0)

#### Example: Create Record
```bash
curl -X POST http://localhost:4000/api/records \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"type":"INCOME","category":"Salary","date":"2024-04-01","description":"April Salary"}'
```

---

### Analytics

#### Summary
`GET /api/analytics/summary`
- Returns total income and expenses across all records.
- Example:
```bash
curl -X GET http://localhost:4000/api/analytics/summary \
  -H "Authorization: Bearer <JWT>"
```
- Response:
  ```json
  {
    "success": true,
    "summary": {
      "income": 5000,
      "expense": 3200
    }
  }
  ```

#### Trends
`GET /api/analytics/trends`
- Returns the 10 most recent financial records (sorted by date).
- Example:
```bash
curl -X GET http://localhost:4000/api/analytics/trends \
  -H "Authorization: Bearer <JWT>"
```
- Response:
  ```json
  {
    "success": true,
    "recent": [
      { "amount": 1200, "type": "EXPENSE", ... },
      ...
    ]
  }
  ```

---

## Error Responses
All errors return:
```json
{
  "status": "error",
  "message": "...",
  "timestamp": "..."
}
```

## Roles & Access
- **ADMIN**: Full CRUD on users and records
- **ANALYST**: Read-only access to records, analytics
- **VIEWER**: Read-only access to dashboard data

## Security
- becrypt.Js password hashing
- JWT stateless authentication
- Helmet for HTTP headers
- Input sanitization (XSS, injection)
- CORS restricted by origin

## Development
- All code in `src/` (modules, controllers, services, middleware, utils)
- Use TypeScript for type safety
- Modular, clean architecture

---

# This codebase into four concentric layers with inward-pointing dependencies:

Layer	Directory	Responsibility	Dependencies
Domain	src/domain/	Entities, value objects, domain errors	None
Application	src/application/	Use-case orchestration (services)	Domain
Infrastructure	src/infrastructure/	SQLite repos, JWT, bcrypt	Domain
Presentation	src/presentation/	Express controllers, routes, middleware	Application


# User Role and Management 
- The application supports three types of users: Viewer, Analyst, and Admin.
- Each user is assigned a role that defines their level of access within the system.
- Role-based permissions ensure that users can only perform actions allowed for their role.

# Financial Record Management
- This module manages financial transactions such as income and expenses.
- It allows creating, viewing, updating, and deleting transaction records.
- Users can filter transactions based on category, type, and date range.

# Dashboard summary Api's
- This module provides APIs to calculate and return summarized financial data.
- It includes total income, total expenses, and net balance calculations.
- It also supports category-wise analysis and monthly financial trends.

# Access control Logic
- Access to system features is restricted based on user roles.
- Middleware is used to validate user permissions before processing requests.
- This ensures secure and controlled interaction with the system.

# Validations and Error Handling
- Access to system features is restricted based on user roles.
- Middleware is used to validate user permissions before processing requests.
- This ensures secure and controlled interaction with the system.

# Data Persistence
- The system validates all incoming data to ensure correctness and completeness.
- Proper error messages and HTTP status codes are returned for invalid requests.
- This helps maintain reliability and prevents unexpected system behavior.

