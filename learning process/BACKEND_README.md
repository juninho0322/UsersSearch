# Backend Learning Notes

This file explains how the Express backend works, how the code is structured, and why the main pieces exist.

## Backend Goal

The backend is responsible for:

1. Exposing HTTP API routes.
2. Validating request data.
3. Running business logic.
4. Talking to Supabase.
5. Returning consistent JSON responses.
6. Protecting the Supabase service role key.

The frontend should call the backend. The frontend should not talk directly to Supabase with privileged keys.

## Folder Structure

```text
server/src/
  app.ts
  server.ts
  config/
    env.ts
    supabase.ts
  middleware/
    error.middleware.ts
    not-found.middleware.ts
  modules/
    users/
      user.controller.ts
      user.model.ts
      user.repository.ts
      user.routes.ts
      user.service.ts
      user.validation.ts
  routes/
    index.ts
  shared/
    errors/
      AppError.ts
    types/
      api-response.ts
```

## Server Startup

`server.ts` starts the HTTP server.

It imports `app` from `app.ts` and listens on `env.PORT`.

`app.ts` creates the Express app and configures:

- JSON body parsing
- CORS
- API routes under `/api`
- health route
- 404 middleware
- error middleware

The error middleware must be last so it can catch errors from all previous routes.

## Environment Config

`config/env.ts` loads and validates environment variables.

It uses:

- `dotenv`
- `zod`

Required variables:

```text
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Why validate env variables?

Without validation, the server might start with missing or broken config and fail later in a confusing way.

With validation, the app fails early and clearly.

## Supabase Client

`config/supabase.ts` creates one shared Supabase client.

It uses:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The repository layer imports this client.

The service role key is powerful, so it must stay on the backend.

## Route Layer

`modules/users/user.routes.ts` defines the user endpoints:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/:id` | Get one user |
| `POST` | `/api/users` | Create a user |
| `PATCH` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

Routes should only map URLs to controller functions.

They should not contain business logic or database logic.

## Controller Layer

`user.controller.ts` handles Express-specific work:

1. Read request params, query, and body.
2. Validate data with Zod schemas.
3. Call the service layer.
4. Send the HTTP response.
5. Pass errors to `next(error)`.

The controller is the boundary between Express and the application logic.

## Validation Layer

`user.validation.ts` contains Zod schemas.

It validates:

- list query params
- route id params
- create body
- update body

Validation protects the service and repository layers from bad input.

Examples:

- `page` must be a positive integer.
- `limit` must be positive and max 100.
- `salary` cannot be negative.
- `yearsOfService` must be a whole number from 0 to 80.
- create requests require all user fields.
- update requests require at least one field.

## Service Layer

`user.service.ts` contains business logic.

It decides what the app should do, but it does not know Express details.

Examples:

- list users and calculate pagination metadata
- create a user
- update a user
- delete a user
- throw a 404 when a user does not exist

The service calls the repository.

Why have a service layer?

It keeps business rules separate from HTTP code and database code. This makes the app easier to test and easier to change.

## Repository Layer

`user.repository.ts` is the database boundary.

It talks to Supabase and maps between:

- database rows
- application objects

Database row shape:

```ts
{
  id: number;
  user_name: string;
  country: string;
  position: string;
  salary: number;
  department: string;
  years_of_service: number;
}
```

Application shape:

```ts
{
  id: number;
  userName: string;
  country: string;
  position: string;
  salary: number;
  department: string;
  yearsOfService: number;
}
```

The database uses snake_case because that is common in Postgres.

The TypeScript app uses camelCase because that is common in JavaScript.

The repository maps between both shapes.

## List Users Logic

The backend list route supports pagination.

The repository calculates:

```ts
const startIndex = (query.page - 1) * query.limit;
const endIndex = startIndex + query.limit - 1;
```

Then it asks Supabase for that range.

The service returns metadata:

```ts
{
  page,
  limit,
  total,
  totalPages
}
```

This lets the frontend know whether previous and next buttons should be enabled.

## Create User Logic

Create flow:

1. `POST /api/users` hits the route.
2. Controller validates the body.
3. Service calls `createUserRepository`.
4. Repository maps camelCase input to snake_case database columns.
5. Supabase inserts the row.
6. Supabase returns the new row.
7. Repository maps the row back to the frontend shape.
8. Controller returns status `201`.

The frontend does not send `id`.

The database should generate `id`.

## Supabase ID Sequence Issue

If rows were imported with explicit IDs, the database sequence can fall behind.

The symptom is:

```text
duplicate key value violates unique constraint "users_pkey"
```

That means Supabase tried to create an ID that already exists.

Fix file:

```text
server/supabase/fix-users-id-sequence.sql
```

Run that SQL in Supabase to move the sequence past the current max ID.

## Update User Logic

Update flow:

1. `PATCH /api/users/:id` hits the route.
2. Controller validates `id`.
3. Controller validates the request body.
4. Service calls the repository.
5. Repository updates matching row in Supabase.
6. If no row exists, service throws `USER_NOT_FOUND`.
7. Controller returns the updated user.

PATCH means partial update, so the body can contain only the fields that changed.

## Delete User Logic

Delete flow:

1. `DELETE /api/users/:id` hits the route.
2. Controller validates `id`.
3. Service calls the repository.
4. Repository deletes matching row in Supabase.
5. If no row exists, service throws `USER_NOT_FOUND`.
6. Controller returns status `204`.

Status `204` means success with no response body.

## Error Handling

`AppError` is the custom error class.

It stores:

- HTTP status code
- stable error code
- optional details
- message

`error.middleware.ts` converts errors into consistent JSON.

Validation error example:

```json
{
  "error": {
    "message": "Invalid request data",
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

Application error example:

```json
{
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  }
}
```

Database errors are converted to:

```json
{
  "error": {
    "message": "Could not create user.",
    "code": "DATABASE_ERROR",
    "details": "Supabase error details"
  }
}
```

## Tests

The tests mock the repository layer.

Why?

The test suite should not depend on the real Supabase project.

This makes tests:

- faster
- safer
- repeatable
- independent from internet/database state

Route tests check HTTP behavior.

Service tests check business behavior.

## Database Schema

Schema file:

```text
server/supabase/schema.sql
```

It creates the `users` table with:

- id
- user_name
- country
- position
- salary
- department
- years_of_service
- created_at
- updated_at

It also creates an `updated_at` trigger so updates automatically change the timestamp.

## Important Backend Lessons

1. Routes should only connect paths to controllers.
2. Controllers should handle HTTP details and validation.
3. Services should hold business rules.
4. Repositories should be the only layer that knows database details.
5. Environment variables should be validated at startup.
6. Secrets must stay on the backend.
7. Tests should not depend on a live production database.
8. Database row names and frontend object names can differ as long as the repository maps them clearly.
