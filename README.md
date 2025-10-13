# Smart Bus RFID — Admin Backend & Frontend

Smart Bus is a simple demo system for managing RFID transit cards, recording transactions (recharges and payments), and providing an admin dashboard for manual operations and reporting.

This repository contains two main projects:

- `smart-bus-backend/` — Node.js + Express backend with MariaDB (mysql2) for data storage.
- `smart-bus-frontend/` — React + Vite single-page admin dashboard for manual operations and reporting.

## Goals
- Provide an admin dashboard to create and manage transit cards.
- Support secure admin access (JWT-based) and simple roles (admin/operator).
- Ensure money-like operations (recharge/pay) are atomic using DB transactions.
- Offer a starting point for extending with more features (reporting, users, CI, tests).

---

## Quick architecture overview
- Backend: Express app (ESM) using `mysql2/promise` connection pool. Key modules:
  - `config/db.js` — database connection pool
  - `models/` — data access for `cards`, `transactions`, `users`
  - `controllers/` — HTTP handlers for cards, auth, and admin functions
  - `routes/` — Express routers (cards, auth, admin)
  - `middleware/` — auth (JWT), validation (Joi), error handling
- Frontend: React (Vite) app with pages and components under `smart-bus-frontend/src/`:
  - `api.js` — centralized fetch helper (attaches Authorization header)
  - `components/` — Nav, Logo, forms, cards list, etc.
  - `pages/` — Home, Dashboard, Users, Reports, Auth, NotFound
  - Styling: a futuristic dark theme in `src/styles.css`

---

## Prerequisites
- Node.js (16+ recommended)
- npm
- MariaDB / MySQL server

---

## Backend — setup and run
1. Copy `.env.example` to `.env` in `smart-bus-backend/` and fill in values (DB credentials, JWT secret):

```env
# Example values
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=smartbus
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

2. Install and start the backend:

```powershell
cd smart-bus-backend
npm install
# start (use dev script or node directly)
npm run dev  # or: node server.js
```

3. Initialize the database schema and seed sample data (if a script exists):

```powershell
npm run init-db
```

The backend exposes these notable endpoints (see code for full list):
- GET `/` — health check
- POST `/auth/login` — obtain JWT (body: { email, password })
- GET `/api/cards` — list cards
- POST `/api/cards`/recharge — recharge a card (admin/operator)
- POST `/api/cards`/pay — record a payment (admin/operator)
- GET `/api/cards/transactions` — list transactions
- GET `/api/users` — list users (admin only)
- GET `/api/reports/fare-by-day` — aggregated payments by day (admin only)

Note: protected routes require an Authorization header: `Authorization: Bearer <token>`.

---

## Frontend — setup and run
1. Copy `.env.example` to `.env` in `smart-bus-frontend/` and set `VITE_API_URL` to your backend URL (e.g., `http://localhost:5000`).

2. Install and start the dev server:

```powershell
cd smart-bus-frontend
npm install
npm run dev
```

3. Open the Vite URL (usually `http://localhost:5173`).

Features implemented in the frontend:
- Login page (saves JWT to `localStorage` as `sb_token`)
- Dashboard: create cards, recharge, pay, transactions
- Users page (lists users — requires admin token)
- Reports page (line chart of fare collected by day)
- Pages: Home, About, NotFound
- Simple client-side validation and pagination/filtering for cards

---

