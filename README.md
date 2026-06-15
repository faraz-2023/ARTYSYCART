# Artysy

> A marketplace where artists and crafters sell handmade products directly to buyers.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion |
| State | TanStack Query v5, React Router v6 |
| HTTP | Axios (with JWT refresh interceptor) |
| Backend | FastAPI, SQLAlchemy 2 (async), PostgreSQL |
| Migrations | Alembic |
| Auth | JWT (access + refresh tokens), bcrypt |

---

## Project structure

```
artysy/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (shadcn-style + navigation)
│   │   ├── context/        # React context providers (Auth, Theme)
│   │   ├── hooks/          # Reusable hooks
│   │   ├── layouts/        # Page layout wrappers
│   │   ├── pages/          # Route-level page components
│   │   ├── routes/         # Router config + ProtectedRoute guard
│   │   ├── services/       # Axios client + React Query client
│   │   ├── styles/         # Tailwind globals + CSS variables
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # cn(), formatters, error helpers
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── backend/
    ├── app/
    │   ├── api/v1/         # FastAPI routers + endpoints
    │   ├── auth/           # JWT helpers, password hashing, dependencies
    │   ├── core/           # Settings (pydantic-settings)
    │   ├── database/       # Engine, session factory, Base
    │   ├── middleware/      # Logging middleware
    │   ├── models/         # SQLAlchemy ORM models
    │   ├── schemas/        # Pydantic request / response schemas
    │   ├── services/       # Business logic / CRUD services
    │   ├── utils/          # Pagination, custom exceptions
    │   └── main.py         # FastAPI app factory + CORS
    ├── alembic/            # Migration environment
    ├── alembic.ini
    ├── requirements.txt
    └── run.py              # Dev server entry point
```

---

## Getting started

### Prerequisites
- Node.js ≥ 20
- Python ≥ 3.11
- PostgreSQL 15+

---

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # edit as needed
npm run dev
```

Runs at **http://localhost:5173**

---

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL, SECRET_KEY, etc.

# Run migrations (once DB is up)
alembic upgrade head

# Start dev server
python run.py
```

API runs at **http://localhost:8000**  
Swagger UI: **http://localhost:8000/docs**

---

### Database (local)

```sql
CREATE USER artysy_user WITH PASSWORD 'artysy_password';
CREATE DATABASE artysy_db OWNER artysy_user;
```

---

### Generating a new migration

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

---

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend origin |
| `VITE_API_PREFIX` | `/api/v1` | API prefix |
| `VITE_APP_NAME` | `Artysy` | App display name |
| `VITE_ENABLE_DEVTOOLS` | `true` | Show React Query Devtools |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | General app secret |
| `JWT_SECRET_KEY` | JWT signing key — keep private |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL |
