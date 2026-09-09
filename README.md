# Argo — a walkable 3D supermarket

A fully developed supermarket platform with an immersive 3D store, product catalog, cart, checkout, payments, user accounts, order tracking, and an admin console.

## Stack

- **Frontend** — React 18 + Vite + Three.js (`client/`)
- **Backend** — Node.js + Express + SQLite (`server/`)
- **Payments** — Stripe (test mode) with a built-in mock fallback
- **Auth** — JWT + bcrypt (`admin@argo.shop` / `admin123` seeded)

## Local development

```bash
# backend (port 4000)
cd server
npm install
npm run seed        # optional — server auto-seeds on first start
npm run dev

# frontend (port 5173, proxies /api to :4000)
cd client
npm install
npm run dev
```

Open http://localhost:5173

- Catalog + cart + checkout: `#/products`
- Walkable 3D store: `#/store`
- Admin console: sign in with `admin@argo.shop` / `admin123`, then `#/admin`

## Features

| Feature | Where |
|---|---|
| Walkable first-person 3D store (WASD + drag look, click to grab, minimap) | `#/store` |
| Full product catalog with categories + search | `#/products` |
| Cart drawer, quantities, totals | every page |
| Checkout with Stripe test mode or mock payment | `#/checkout` |
| Order tracking (pending → paid → packed → shipped → delivered) | `#/orders` |
| Admin console — products CRUD + order fulfilment | `#/admin` |
| JWT auth, role-based admin guard, SQLite storage | API |

## Configuration

Server environment variables (see `server/.env.example`):

| Var | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `JWT_SECRET` | Signing secret — set a long random string in prod |
| `DATABASE_PATH` | SQLite file (default `server/data.db`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeded admin account |
| `STRIPE_SECRET_KEY` | Enable real Stripe test-mode checkout |

Client build env:

| Var | Purpose |
|---|---|
| `VITE_API_URL` | Full API base for production (e.g. `https://your-api.onrender.com`) |

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. In Render dashboard choose **New → Blueprint**, point at the repo and select `render.yaml`.
3. Add a `STRIPE_SECRET_KEY` (test key) in the service env vars if you want real test payments.
4. Your API is live at `https://argo-supermarket-api.onrender.com`.

> Render's free tier uses an ephemeral disk — restarting the service resets the SQLite file. For persistent data, add the Render **Persistent Disk** add-on and point `DATABASE_PATH` into it.

### Frontend → Vercel

1. Deploy the `client/` folder as a Vite project (or use `vercel.json` already included).
2. Set `VITE_API_URL` to your Render URL: `https://argo-supermarket-api.onrender.com`
3. Rebuild + deploy. The cart, catalog, checkout and 3D store all call the API.

### Alternative: single-host deploy

The backend also servers the client's built files, so you can build the client (`cd client && npm run build`) and run just the Render service — one URL for everything. Make sure to set `VITE_API_URL=""` in that case (same origin).

## API quick reference

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | – | name, email, password |
| POST | `/api/auth/login` | – | email, password |
| GET | `/api/auth/me` | yes | – |
| GET | `/api/products` | – | – |
| POST | `/api/products` | admin | product |
| PUT | `/api/products/:id` | admin | product |
| DELETE | `/api/products/:id` | admin | – |
| POST | `/api/payments/checkout` | yes | items[], successUrl, cancelUrl |
| POST | `/api/orders` | yes | items[], address, paymentId |
| GET | `/api/orders` | yes | – |
| PATCH | `/api/orders/:id/status` | admin | status |

## Notes

- The 3D store is built 100% procedurally — no external models or CDN assets.
- Payments default to a mock flow when no `STRIPE_SECRET_KEY` is set, so the whole loop works out of the box.