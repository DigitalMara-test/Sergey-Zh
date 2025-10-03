# Log Management System

### Option 1: Docker

Start all services with one command:
```bash
docker compose up -d
```

Services will be available at:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

Stop services:
```bash
docker compose down
```

### Option 2: Manual Setup

#### Database
```bash
docker-compose up postgres -d
```

#### Backend
```bash
cd backend
cp .env.example .env
npm run setup
npm run dev
```

Server runs on http://localhost:3000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## API

- `GET /health` - health check
- `GET /api/logs` - get all logs
- `POST /api/logs` - create log entry
- `POST /api/logs/external` - fetch from jsonplaceholder and save

Example:
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"json": {"message": "test"}}'
```

## Database Schema

```sql
CREATE TABLE log (
  id SERIAL PRIMARY KEY,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  json JSON NOT NULL
);
```

## Tests

```bash
cd backend
npm test
```

## Tech

**Backend:** TypeScript, Express, PostgreSQL, Zod
**Frontend:** React, TypeScript, Vite, Tailwind

## Scripts

### Backend
- `npm run setup` - install deps and run migrations
- `npm run dev` - dev server with hot reload
- `npm run build` - compile TypeScript
- `npm test` - run tests with coverage
- `npm run db:migrate` - run migrations only

### Frontend
- `npm run dev` - start vite dev server
- `npm run build` - build for production
- `npm run lint` - run eslint
