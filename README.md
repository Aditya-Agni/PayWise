# PayWise

PayWise is a beginner-friendly React landing page and Node.js API foundation for tracking expenses and recurring payments.

## Project structure

```text
paywise/
├── frontend/   # React + Vite + Tailwind CSS
└── backend/    # Node.js API (built-in HTTP module; no Express dependency)
```

In `frontend/src/pages`, only `LandingPage.jsx`, `SignInPage.jsx`, and `SignUpPage.jsx` are implemented pages. The extra files inside `frontend/src/components` are intentionally empty placeholders so the team can implement those features one by one.

## Requirements

- Node.js 20 or newer recommended
- npm

## Start the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend runs at `http://localhost:4000` by default and stores data in `backend/data/store.json`.

## Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite shows in the terminal, usually `http://localhost:5173`.

If the backend runs at a different URL, create `frontend/.env` with:

```text
VITE_API_URL=http://localhost:4000
```

Restart Vite after changing environment variables.

## What currently works

- The monochrome responsive landing page.
- Get Started opens a Sign In / Create Account modal.
- Sign Up and Sign In submit to the Node.js backend.
- Passwords are hashed before being saved.
- Authenticated transaction and recurring-payment API routes exist.
- `FinanceContext` and `services/api.js` provide frontend data functions for the next development stage.
- The backend stores users, transactions, and recurring payments in a JSON file for this prototype.

## API endpoints

### Authentication

- `POST /api/auth/signup` — `{ "name": "Example User", "email": "user@example.com", "password": "at-least-eight-chars" }`
- `POST /api/auth/signin` — `{ "email": "user@example.com", "password": "at-least-eight-chars" }`

Successful auth returns a `token` and public `user`. The frontend stores the token and sends it as a Bearer token for finance requests.

### Transactions (Bearer token required)

- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

Transaction body example:

```json
{
  "title": "Groceries",
  "amount": 850,
  "category": "Food",
  "paymentMethod": "UPI",
  "date": "2026-10-22"
}
```

### Recurring payments (Bearer token required)

- `GET /api/recurring-payments`
- `POST /api/recurring-payments`
- `PUT /api/recurring-payments/:id`
- `DELETE /api/recurring-payments/:id`
- `POST /api/recurring-payments/:id/pay`

Recurring payment body example:

```json
{
  "title": "Streaming Subscription",
  "amount": 649,
  "type": "Subscription",
  "frequency": "Monthly",
  "nextDueDate": "2026-11-05"
}
```

For Mark as Paid, send the current `nextDueDate` as `expectedDueDate` so an old/double-click request does not silently record a different due occurrence.

## Important prototype limitations

- This is a hackathon foundation, not production-ready financial software.
- The session token map is in memory. Restarting the backend invalidates existing sessions; sign in again.
- JSON-file storage is fine for a simple local demo but is not suitable for concurrent or production workloads. A real deployment should use a database and durable secure sessions.
- Dashboard, transactions and recurring-payment UI component files are intentionally empty. The API and Context API foundations exist so those screens can be built next.
