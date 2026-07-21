# UsersSearch

UsersSearch is a study full-stack CRUD application built for learning purposes. It demonstrates a React/Vite frontend, an Express/TypeScript API, Zod validation, and Supabase persistence.

This project is not intended to store real private user data. Environment variables in this README are examples only; keep real `.env` files, Supabase service role keys, and any other secrets out of GitHub.

## Project Structure

- `client/` - React frontend.
- `server/` - Express API.
- `server/supabase/schema.sql` - Supabase table schema.

## Requirements

- Node.js 20 or newer.
- npm.
- A Supabase project.

## Supabase Setup

1. Open the Supabase SQL editor.
2. Run `server/supabase/schema.sql`.
3. Copy `server/.env.example` to `server/.env`.
4. Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

The service role key must stay on the backend. Do not expose it in the React app.

## Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The frontend expects:

```bash
VITE_API_URL=https://users-search-api.onrender.com
```

For local backend development, override it with:

```bash
VITE_API_URL=http://localhost:4000
```

## Backend Setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The backend expects:

```bash
PORT=4000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | List users with search, sorting, and pagination |
| `GET` | `/api/users/:id` | Get one user |
| `POST` | `/api/users` | Create a user |
| `PATCH` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

## Quality Checks

Backend:

```bash
cd server
npm run build
npm test -- --run
```

Frontend:

```bash
cd client
npm run lint
npm run build
```
