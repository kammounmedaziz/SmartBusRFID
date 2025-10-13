# SmartBus Backend

Node.js + Express backend for manual web operations (cards, transactions).

Prereqs:
- Node 18+ (or compatible)
- MariaDB/MySQL running locally

Quick start:

1. Install dependencies

```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"
npm install
```

2. Configure `.env` (there's a sample `.env` in the repo). At minimum set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.

3. Initialize the database and sample cards

```powershell
# SmartBus Backend

Node.js + Express backend for manual web operations (cards, transactions).

Prereqs
- Node 18+ (or compatible)
- MariaDB/MySQL running locally

Quick start

1. Install dependencies

```powershell
cd "c:\Users\pc\Desktop\RFID PROJECT\smart-bus-backend"
npm install
```

2. Configure `.env`
- Copy `.env.example` to `.env` and edit DB credentials and `JWT_SECRET`.

3. Initialize the database and seed sample cards (and optionally admin user)

```powershell
# To seed admin user, set ADMIN_EMAIL and ADMIN_PASSWORD in env for this run
$env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='AdminPass123'; npm run init-db
# Or just run without admin seeding
npm run init-db
```

4. Run the server

```powershell
npm start
```

API endpoints
- GET /api/cards — list all cards
- POST /api/cards/recharge — body: { uid, amount } (protected)
- POST /api/cards/pay — body: { uid, fare } (protected)
- GET /api/cards/transactions — list transactions

Authentication (JWT)

1. Login

POST /auth/login
Body: { email, password }

Response: { token }

2. Use token

Include header: Authorization: Bearer <token>

Example (curl):

```bash
TOKEN="<paste-token-here>"
curl -X POST http://localhost:5000/api/cards/recharge \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"uid":"CARD-001","amount":10}'
```

Testing

Integration tests (Jest + Supertest) are included.

Make sure the DB is initialized (see step 3), then run:

```powershell
npm test
```

Notes & architecture
- Validation: recharge/pay endpoints validate input (Joi) and reject bad values.
- Atomic updates: balance updates and transaction inserts are performed in a DB transaction (SELECT ... FOR UPDATE + UPDATE + INSERT + COMMIT) to avoid race conditions.
- Auth: simple JWT-based auth is implemented; set a secure `JWT_SECRET` in production.

If you want the React frontend scaffolded next, tell me and I will create a `frontend/` app that uses these endpoints.

