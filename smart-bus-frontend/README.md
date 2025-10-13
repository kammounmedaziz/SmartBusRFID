# Smart Bus Frontend

Minimal React + Vite frontend for Smart Bus admin tasks.

## Quick start

1. Install deps

```powershell
cd smart-bus-frontend
npm install
```

1. Create `.env` from `.env.example` and set your backend API URL

```env
VITE_API_URL=http://localhost:5000
```

1. Run dev server

```powershell
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

## Features
- Login (POST /auth/login)
- View cards (GET /api/cards)
- Create card (POST /api/cards)
- Recharge (POST /api/cards/recharge)
- Pay (POST /api/cards/pay)
- View transactions (GET /api/cards/transactions)

## Notes
- This frontend expects the backend to support CORS from the dev origin. If you see CORS errors, add the `cors` middleware to the backend Express app:

```js
import cors from 'cors'
app.use(cors())
```

- Tokens are stored in `localStorage` under `sb_token`.
