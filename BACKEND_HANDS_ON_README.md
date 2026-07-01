# Backend Hands-On Build Guide

This file is the practical companion to `BACKEND_README.md`.

The first README explains the backend ideas. This README tells you what to create first, which folders and files come next, what each file should contain, and why the order matters.

No backend code has been added to this project yet. Use this as your checklist when you start building the backend yourself.

## 1. What You Are Building

You are building a REST API for the existing users table.

Today, the frontend reads users from:

`src/data/mockUsers.ts`

The backend goal is to eventually replace that direct import with an HTTP request:

`GET /api/users`

That means the backend must become responsible for:

| Responsibility | Why |
| --- | --- |
| Returning users | The table needs data |
| Searching users | The search input should be backed by the API |
| Sorting users | The table headers should be able to request sorted data |
| Paginating users | Real APIs should not return unlimited records |
| Validating input | Bad query params should not reach business logic |
| Returning clear errors | The frontend needs predictable failure responses |

Start with read-only users. Do not begin with create, update, delete, login, authentication, or deployment.

## 2. Recommended Final Backend Structure

When finished, your backend folder should look like this:

```txt
server/
  package.json
  tsconfig.json
  .env
  .env.example
  src/
    server.ts
    app.ts
    config/
      env.ts
    middleware/
      error.middleware.ts
      not-found.middleware.ts
    shared/
      errors/
        AppError.ts
      types/
        api-response.ts
    modules/
      users/
        user.model.ts
        user.mock-data.ts
        user.validation.ts
        user.repository.ts
        user.service.ts
        user.controller.ts
        user.routes.ts
    routes/
      index.ts
  tests/
    users/
      user.service.test.ts
      user.routes.test.ts
```

You do not create everything at once. Create it in the order below.

## 3. Build Order Overview

Follow this order:

| Order | Create | Why it comes here |
| --- | --- | --- |
| 1 | `server/` folder | Separates backend from frontend |
| 2 | Backend package setup | Gives backend its own scripts and dependencies |
| 3 | TypeScript config | Makes backend compile independently |
| 4 | `src/app.ts` | Builds the app without starting the port |
| 5 | `src/server.ts` | Starts the server |
| 6 | `src/config/env.ts` | Centralizes environment values |
| 7 | Health route | Proves the server works |
| 8 | Users model | Defines the data contract |
| 9 | Users mock data | Gives repository temporary data |
| 10 | Users repository | Creates data access boundary |
| 11 | Users service | Adds business rules |
| 12 | Users validation | Protects service from bad input |
| 13 | Users controller | Converts HTTP request into service call |
| 14 | Users routes | Connects URL to controller |
| 15 | Root routes file | Keeps route registration clean |
| 16 | Error middleware | Makes failures consistent |
| 17 | Tests | Proves behavior before refactoring |
| 18 | Database later | Replaces mock repository safely |

This order matters because every step gives the next step something stable to depend on.

## 4. Step 1: Create The Backend Root Folder

Create:

```txt
server/
```

Why:

The current project is a Vite React frontend. Keeping backend code in `server/` avoids mixing frontend components with backend API files.

The frontend can stay in the existing root `src/` folder. The backend gets its own `server/src/`.

Mental model:

```txt
project root
  src/        frontend React app
  server/src backend API app
```

## 5. Step 2: Create Backend Package Setup

Create:

```txt
server/package.json
```

What this file should contain:

| Area | What to include | Why |
| --- | --- | --- |
| Name | Backend package name | Identifies the backend project |
| Type | ESM or CommonJS setting | Matches how imports work |
| Scripts | `dev`, `build`, `start`, `test`, `lint` | Gives repeatable commands |
| Runtime dependencies | Express/Fastify, CORS, dotenv, Zod | Needed by the API |
| Dev dependencies | TypeScript, tsx/nodemon, test tools, types | Needed during development |

Recommended learning choice:

| Choice | Reason |
| --- | --- |
| Express | Simple, popular, easy to understand |
| TypeScript | Matches the frontend |
| Zod | Clean validation |
| Vitest | Fast TypeScript-friendly tests |
| Supertest | Tests HTTP endpoints |

What not to add yet:

| Skip for now | Why |
| --- | --- |
| Authentication | Too early |
| Database ORM | Add after mock API works |
| Docker | Add after local backend works |
| Deployment tools | Add after tested backend works |

## 6. Step 3: Create Backend TypeScript Config

Create:

```txt
server/tsconfig.json
```

What this file should control:

| Setting area | Purpose |
| --- | --- |
| Input folder | Compile files from `server/src` |
| Output folder | Build into `server/dist` |
| Module system | Match your backend package setting |
| Strict mode | Catch type mistakes early |
| Node types | Let TypeScript understand backend APIs |

Why it comes early:

Every backend file after this should be TypeScript. You want the compiler checking your structure from the start.

## 7. Step 4: Create Environment Files

Create:

```txt
server/.env
server/.env.example
```

What `.env` should contain:

| Variable | Example purpose |
| --- | --- |
| `PORT` | Which port the backend runs on |
| `FRONTEND_ORIGIN` | Which frontend URL is allowed by CORS |
| `NODE_ENV` | Development, test, production |

What `.env.example` should contain:

The same variable names, but without private values.

Why:

`.env` is for your machine. `.env.example` teaches other developers what values they need.

Important:

Do not commit real secrets. Even in learning projects, practice this habit.

## 8. Step 5: Create Config Reader

Create:

```txt
server/src/config/env.ts
```

What this file should contain:

| Responsibility | Detail |
| --- | --- |
| Load environment variables | Read values from `.env` |
| Validate required values | Make sure required config exists |
| Convert types | Turn `PORT` from string into number |
| Export one config object | Other files import config from one place |

Why this file exists:

Without a config file, environment values get scattered across the app. That makes the backend harder to test and change.

Good rule:

Only `env.ts` should know how raw environment variables are read.

Other files should use a clean config object.

## 9. Step 6: Create The App File

Create:

```txt
server/src/app.ts
```

What this file should contain:

| Responsibility | Detail |
| --- | --- |
| Create the Express/Fastify app | This is the backend application |
| Register JSON body parsing | Allows API to read JSON requests |
| Register CORS | Allows frontend to call backend |
| Register routes | Connects API endpoints |
| Register not-found middleware | Handles unknown routes |
| Register error middleware | Handles thrown errors |
| Export the app | Tests can use app without opening a port |

Why this comes before `server.ts`:

The app is the API itself. The server is only the thing that listens on a network port.

Separating them makes testing easier.

Mental model:

| File | Job |
| --- | --- |
| `app.ts` | Build the API |
| `server.ts` | Run the API |

## 10. Step 7: Create The Server File

Create:

```txt
server/src/server.ts
```

What this file should contain:

| Responsibility | Detail |
| --- | --- |
| Import app | Uses the app built in `app.ts` |
| Import config | Reads the port from config |
| Start listening | Opens the backend port |
| Log startup message | Confirms backend is running |

Why this file should stay small:

Starting the server is not business logic. Keep this file boring.

If there is a bug in users search or validation, you should not need to touch `server.ts`.

## 11. Step 8: Add A Health Endpoint First

Before building users, add one simple endpoint:

```txt
GET /health
```

Where it can live at first:

```txt
server/src/app.ts
```

What it should return:

| Field | Meaning |
| --- | --- |
| `status` | Confirms the API is alive |
| `timestamp` | Optional, shows when response was generated |

Why:

This proves your backend runs before you add users complexity.

Do not skip this. A health endpoint gives you a quick way to check:

| Check | What it proves |
| --- | --- |
| Browser opens `/health` | Server is running |
| JSON response appears | Route is registered |
| No CORS issue later | Frontend can reach backend |

## 12. Step 9: Create Shared Error Type

Create:

```txt
server/src/shared/errors/AppError.ts
```

What this file should contain:

| Responsibility | Detail |
| --- | --- |
| Custom error class/type | Represents expected API errors |
| Status code | Example: 400, 404, 422 |
| Error code | Stable string like `USER_NOT_FOUND` |
| Optional details | Validation details or extra info |

Why:

Expected errors should be handled differently from unexpected crashes.

Example expected errors:

| Error | Status |
| --- | --- |
| Invalid query params | 422 |
| User not found | 404 |
| Invalid route param | 400 |

Unexpected errors should become a generic 500 response.

## 13. Step 10: Create API Response Types

Create:

```txt
server/src/shared/types/api-response.ts
```

What this file should contain:

| Type | Purpose |
| --- | --- |
| Success response shape | Standard structure for good responses |
| Error response shape | Standard structure for failed responses |
| Pagination metadata shape | Reusable pagination info |

Why:

The frontend should not receive random response shapes from different endpoints.

Good APIs are predictable.

For this project, successful list responses should include:

| Field | Purpose |
| --- | --- |
| `data` | The users |
| `meta` | Pagination information |

Error responses should include:

| Field | Purpose |
| --- | --- |
| `error.message` | Human-readable message |
| `error.code` | Stable app error code |
| `error.details` | Optional details |

## 14. Step 11: Create Middleware

Create:

```txt
server/src/middleware/error.middleware.ts
server/src/middleware/not-found.middleware.ts
```

### `error.middleware.ts`

What it should contain:

| Responsibility | Detail |
| --- | --- |
| Catch thrown errors | Central place for errors |
| Detect expected app errors | Use their status and code |
| Hide unexpected details | Return safe 500 response |
| Return consistent shape | Always use the error response format |

Why:

Without error middleware, each controller starts handling errors differently.

### `not-found.middleware.ts`

What it should contain:

| Responsibility | Detail |
| --- | --- |
| Catch unknown routes | Example: `/api/banana` |
| Return 404 | The route does not exist |
| Use standard error shape | Same response style as other errors |

Why:

Unknown routes are still API responses. They should be clear and consistent.

## 15. Step 12: Create Users Module Folder

Create:

```txt
server/src/modules/users/
```

Why:

Users are the first real feature of this backend. Keep every users-related backend file in one feature folder.

Inside this folder, you will create:

```txt
user.model.ts
user.mock-data.ts
user.validation.ts
user.repository.ts
user.service.ts
user.controller.ts
user.routes.ts
```

Recommended order:

1. Model
2. Mock data
3. Repository
4. Service
5. Validation
6. Controller
7. Routes

The order follows dependency flow. Routes need controllers. Controllers need services. Services need repositories and models.

## 16. Step 13: Create User Model

Create:

```txt
server/src/modules/users/user.model.ts
```

What this file should contain:

| Item | Purpose |
| --- | --- |
| `User` type/interface | Backend version of the user shape |
| `UserSortField` type | Whitelisted sortable fields |
| `UserSortOrder` type | `asc` or `desc` |
| `ListUsersQuery` type | Clean query object after validation |
| Optional DTO types | Shapes sent to or from API |

The `User` model should match the frontend data shape:

| Field | Type |
| --- | --- |
| `id` | number |
| `userName` | string |
| `country` | string |
| `position` | string |
| `salary` | number |
| `department` | string |
| `yearsOfService` | number |

Why model comes first:

Every other users file needs to know what a user is.

Senior habit:

Define the data shape before writing logic.

## 17. Step 14: Create User Mock Data

Create:

```txt
server/src/modules/users/user.mock-data.ts
```

What this file should contain:

| Item | Purpose |
| --- | --- |
| Temporary users array | Backend data source before database |
| Import of `User` type | Keeps mock data typed |

Where the data should come from:

Use the same shape as the frontend `src/data/mockUsers.ts`.

Why:

This lets the backend return familiar data first. Later, this file will be replaced by database access.

Important:

Do not import frontend files into the backend. Copy the shape concept, but keep backend independent.

Why not import from frontend?

| Reason | Explanation |
| --- | --- |
| Separation | Frontend and backend should not depend on each other's internals |
| Deployment | Backend may run separately |
| Testing | Backend tests should not need frontend files |
| Future database | Mock data is temporary |

## 18. Step 15: Create User Repository

Create:

```txt
server/src/modules/users/user.repository.ts
```

What this file should contain:

| Function responsibility | Purpose |
| --- | --- |
| List all users | Gives service access to users |
| Find user by id | Supports `GET /api/users/:id` later |
| Optional count helper | Useful when database pagination arrives |

What this file should not contain:

| Avoid | Why |
| --- | --- |
| HTTP request/response objects | Repository is not a web layer |
| Express/Fastify imports | Repository should not know the framework |
| Search business rules | Service owns the rules |
| Response formatting | Controller owns response shape |

Why repository comes before service:

The service needs a way to get data. The repository provides that boundary.

Mental model:

The repository is the only users layer that knows where data lives.

Today:

`repository -> mock array`

Later:

`repository -> database`

The service should not need to change much when this switch happens.

## 19. Step 16: Create User Service

Create:

```txt
server/src/modules/users/user.service.ts
```

What this file should contain:

| Function responsibility | Purpose |
| --- | --- |
| List users | Main use case for table data |
| Apply search | Filter users by search text |
| Apply sorting | Sort users by allowed fields |
| Apply pagination | Return only requested page |
| Calculate metadata | Total, page, limit, total pages |
| Get user by id later | Support detail endpoint |

What this file should not contain:

| Avoid | Why |
| --- | --- |
| Express/Fastify request objects | Service should not know HTTP |
| Raw query strings | Validation should clean input first |
| Database-specific code | Repository owns storage |
| UI formatting | Frontend owns display formatting |

Why service comes after repository:

The service uses repository data to apply business rules.

For this app, business rules are:

| Rule | Example |
| --- | --- |
| Default page | Page 1 |
| Default limit | 10 |
| Maximum limit | 100 |
| Default sort field | Maybe `id` |
| Default sort order | Maybe `asc` |
| Search fields | userName, country, position, department |
| Empty results | Return empty list, not an error |

Senior habit:

If you can describe a rule in English, it probably belongs in the service.

## 20. Step 17: Create User Validation

Create:

```txt
server/src/modules/users/user.validation.ts
```

What this file should contain:

| Validation target | Rules |
| --- | --- |
| `search` | Optional string |
| `sortBy` | Optional allowed field only |
| `order` | Optional `asc` or `desc` |
| `page` | Optional positive number |
| `limit` | Optional positive number with max |
| `id` param | Must be valid positive number |

Why validation comes before controller wiring:

The controller should call the service with clean input.

Bad request examples:

| Request | Should happen |
| --- | --- |
| `/api/users?page=-1` | Return validation error |
| `/api/users?limit=abc` | Return validation error |
| `/api/users?sortBy=password` | Return validation error |
| `/api/users?order=sideways` | Return validation error |

What validation should output:

A clean object that the service can trust.

For example, after validation:

| Field | Cleaned value idea |
| --- | --- |
| `search` | string or undefined |
| `sortBy` | valid sort field |
| `order` | `asc` or `desc` |
| `page` | number |
| `limit` | number |

## 21. Step 18: Create User Controller

Create:

```txt
server/src/modules/users/user.controller.ts
```

What this file should contain:

| Controller function | Purpose |
| --- | --- |
| `listUsers` | Handles `GET /api/users` |
| `getUserById` later | Handles `GET /api/users/:id` |
| `createUser` later | Handles `POST /api/users` |
| `updateUser` later | Handles `PATCH /api/users/:id` |
| `deleteUser` later | Handles `DELETE /api/users/:id` |

What `listUsers` should do:

1. Read query params from the HTTP request.
2. Validate query params.
3. Pass clean query values to the service.
4. Receive result from service.
5. Send JSON response.

What this file should not do:

| Avoid | Why |
| --- | --- |
| Search users directly | Service owns rules |
| Sort users directly | Service owns rules |
| Read database directly | Repository owns data |
| Build complex validation manually | Validation file owns schemas |

Why controller comes after service and validation:

The controller connects HTTP to your clean backend logic. It needs validation and service functions to already exist.

Senior habit:

Controllers should be thin. If a controller gets complicated, logic is probably in the wrong layer.

## 22. Step 19: Create User Routes

Create:

```txt
server/src/modules/users/user.routes.ts
```

What this file should contain:

| Route | Controller |
| --- | --- |
| `GET /` | `listUsers` |
| `GET /:id` later | `getUserById` |
| `POST /` later | `createUser` |
| `PATCH /:id` later | `updateUser` |
| `DELETE /:id` later | `deleteUser` |

Important:

This file should define users routes relative to `/users`, not the full `/api/users`.

For example:

| In users route file | Mounted later as |
| --- | --- |
| `/` | `/api/users` |
| `/:id` | `/api/users/:id` |

Why:

Routes stay reusable and feature-focused.

What this file should not contain:

| Avoid | Why |
| --- | --- |
| Business logic | Service owns it |
| Data access | Repository owns it |
| Response formatting logic | Controller owns it |

## 23. Step 20: Create Root Routes File

Create:

```txt
server/src/routes/index.ts
```

What this file should contain:

| Responsibility | Detail |
| --- | --- |
| Create root API router | Groups all API routes |
| Mount users routes | Attach users to `/users` |
| Export router | App can mount it at `/api` |

Why:

This keeps `app.ts` clean.

Instead of `app.ts` importing every feature route forever, it imports one root routes file.

Flow:

```txt
app.ts
  mounts /api
routes/index.ts
  mounts /users
user.routes.ts
  defines /
Final endpoint:
  GET /api/users
```

This is the kind of structure that scales as you add features.

## 24. Step 21: Wire Routes Into App

Update:

```txt
server/src/app.ts
```

What to connect:

| App concern | What to mount |
| --- | --- |
| Health endpoint | `/health` |
| API routes | `/api` |
| Not found middleware | After routes |
| Error middleware | Last |

Why order matters:

| Order | Reason |
| --- | --- |
| Body/CORS middleware first | Requests need setup before routes |
| Routes next | Valid endpoints should respond |
| Not found after routes | Only runs when no route matched |
| Error middleware last | Catches errors from everything above |

Middleware order is one of the first backend details worth learning properly.

## 25. Step 22: First Working Backend Milestone

At this point, the backend should support:

```txt
GET /health
GET /api/users
```

Expected behavior for `GET /api/users`:

| Request | Expected result |
| --- | --- |
| `/api/users` | First page of users |
| `/api/users?search=luis` | Users matching search |
| `/api/users?sortBy=salary&order=desc` | Users sorted by salary |
| `/api/users?page=1&limit=5` | First five users |
| `/api/users?sortBy=nope` | Validation error |

Do not move to database until this works.

This is the checkpoint where your architecture proves itself.

## 26. Step 23: Add Service Tests

Create:

```txt
server/tests/users/user.service.test.ts
```

What this file should test:

| Test | Why |
| --- | --- |
| Returns users | Basic list behavior works |
| Search by name | Search rule works |
| Search by country | Search checks intended fields |
| Sort by salary ascending | Numeric sorting works |
| Sort by salary descending | Reverse numeric sorting works |
| Sort by userName | Text sorting works |
| Pagination returns correct slice | Page logic works |
| Pagination metadata is correct | Frontend can render page info |
| Empty search result returns empty array | Empty list is not an error |

Why service tests first:

The service contains most of your rules. Testing it gives high value quickly.

These tests do not need a real HTTP server.

## 27. Step 24: Add Route/API Tests

Create:

```txt
server/tests/users/user.routes.test.ts
```

What this file should test:

| Test | Why |
| --- | --- |
| `GET /health` returns success | Server app is wired |
| `GET /api/users` returns 200 | Users route works |
| Response has `data` and `meta` | Contract is stable |
| Search query works through HTTP | Controller and service connect |
| Invalid page returns validation error | Validation is wired |
| Invalid sort field returns validation error | Whitelist is enforced |
| Unknown route returns 404 | Not-found middleware works |

Why route tests after service tests:

Service tests prove rules. Route tests prove wiring.

## 28. Step 25: Only Then Connect The Frontend

Do this after the backend API works by itself.

Frontend changes later would include:

| Current frontend behavior | Future frontend behavior |
| --- | --- |
| Import `mockUsers` | Fetch from `/api/users` |
| Local loading is instant | Need loading state |
| Local failures cannot happen | Need error state |
| Local sort/search | Send query params to API |
| All data is in memory | Keep current page/result only |

Important:

Do not connect the frontend too early. If frontend and backend are both unfinished, debugging becomes harder.

Build backend first. Test it. Then connect React.

## 29. Step 26: Replace Mock Data With Database Later

Only after the read-only API works, add database files.

Possible future structure:

```txt
server/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    database/
      prisma.ts
```

What each file/folder would do:

| Path | Purpose |
| --- | --- |
| `prisma/schema.prisma` | Defines database tables/models |
| `prisma/migrations` | Tracks database changes |
| `prisma/seed.ts` | Adds initial users |
| `src/database/prisma.ts` | Creates shared database client |

What changes when database is added:

| Layer | Change |
| --- | --- |
| Repository | Reads from database instead of mock array |
| Service | Should mostly stay the same |
| Controller | Should stay the same |
| Routes | Should stay the same |
| Frontend | Should stay the same |

This is the payoff of layered architecture.

## 30. What Each File Should Know About

Use this table when you feel unsure where logic belongs.

| File | Can know about | Should not know about |
| --- | --- | --- |
| `server.ts` | App, port | Users, database queries, validation |
| `app.ts` | Middleware, routes | Search rules, database queries |
| `env.ts` | Environment variables | Users, routes, business logic |
| `user.model.ts` | User shape | Express, database client |
| `user.mock-data.ts` | Temporary user records | HTTP requests |
| `user.repository.ts` | Data source | HTTP requests, response format |
| `user.service.ts` | Business rules | Express, raw database details |
| `user.validation.ts` | Input rules | Database, response sending |
| `user.controller.ts` | Request/response | Data storage details |
| `user.routes.ts` | URLs and methods | Business logic |
| `error.middleware.ts` | Error response shape | User search logic |

## 31. Dependency Direction

Keep imports flowing in one direction:

```txt
routes -> controller -> service -> repository -> data source
```

Avoid reverse imports.

Bad signs:

| Bad sign | Why it is bad |
| --- | --- |
| Repository imports controller | Data layer depends on HTTP |
| Service imports Express request | Business logic tied to framework |
| Model imports route | Data shape tied to API wiring |
| App imports repository directly | Skips layers |

Good sign:

You can replace the repository without rewriting controller or routes.

## 32. First Endpoint Logic In Plain English

For `GET /api/users`, the final flow should read like this:

1. A request arrives at `/api/users`.
2. The users route sends it to the users controller.
3. The controller validates query params.
4. The controller passes clean query values to the users service.
5. The service asks the repository for users.
6. The service filters by search text if search exists.
7. The service sorts by the chosen field.
8. The service paginates the result.
9. The service returns users plus metadata.
10. The controller sends a JSON response.

If you cannot explain your code in this order, pause and simplify.

## 33. Suggested First Day Checklist

Use this checklist for your first backend session:

| Done | Task |
| --- | --- |
| [ ] | Create `server/` |
| [ ] | Create backend package setup |
| [ ] | Create `server/tsconfig.json` |
| [ ] | Create `server/.env` and `server/.env.example` |
| [ ] | Create `server/src/config/env.ts` |
| [ ] | Create `server/src/app.ts` |
| [ ] | Create `server/src/server.ts` |
| [ ] | Add `GET /health` |
| [ ] | Run backend locally |
| [ ] | Confirm `/health` works |

Stop there if you are tired. A working health endpoint is a real milestone.

## 34. Suggested Second Day Checklist

Use this checklist for the users flow:

| Done | Task |
| --- | --- |
| [ ] | Create `server/src/modules/users/` |
| [ ] | Create `user.model.ts` |
| [ ] | Create `user.mock-data.ts` |
| [ ] | Create `user.repository.ts` |
| [ ] | Create `user.service.ts` |
| [ ] | Create `user.validation.ts` |
| [ ] | Create `user.controller.ts` |
| [ ] | Create `user.routes.ts` |
| [ ] | Create `server/src/routes/index.ts` |
| [ ] | Mount users route under `/api/users` |
| [ ] | Confirm `GET /api/users` works |

Stop when plain `/api/users` works before adding search or sort.

## 35. Suggested Third Day Checklist

Use this checklist for real API behavior:

| Done | Task |
| --- | --- |
| [ ] | Add search query support |
| [ ] | Add sort field support |
| [ ] | Add sort order support |
| [ ] | Add pagination support |
| [ ] | Add validation errors |
| [ ] | Add not-found middleware |
| [ ] | Add error middleware |
| [ ] | Add service tests |
| [ ] | Add route tests |
| [ ] | Confirm invalid requests fail clearly |

After this, your backend has the important flow.

## 36. File Creation Order With Purpose

Use this as your quick reference:

| Create first | Then create | Because |
| --- | --- | --- |
| `server/package.json` | `server/tsconfig.json` | Tooling before source files |
| `env.ts` | `app.ts` | App needs config |
| `app.ts` | `server.ts` | Server needs app |
| `user.model.ts` | `user.mock-data.ts` | Data needs type |
| `user.mock-data.ts` | `user.repository.ts` | Repository needs data source |
| `user.repository.ts` | `user.service.ts` | Service needs data access |
| `user.validation.ts` | `user.controller.ts` | Controller needs clean input |
| `user.service.ts` | `user.controller.ts` | Controller needs use cases |
| `user.controller.ts` | `user.routes.ts` | Routes need handlers |
| `user.routes.ts` | `routes/index.ts` | Root router mounts feature routes |
| `routes/index.ts` | `app.ts` route mounting | App mounts root API |

## 37. Common Junior Mistakes To Avoid

| Mistake | Better habit |
| --- | --- |
| Put all backend code in `server.ts` | Split app, routes, controller, service, repository |
| Validate inside service after logic starts | Validate before service receives input |
| Let controller sort/filter users | Put business rules in service |
| Let service import Express types | Keep service framework-independent |
| Let repository format API responses | Repository should only return data |
| Return different error shapes | Use one error format |
| Add database before route works | Start with mock repository |
| Add CRUD before list endpoint is solid | Master read flow first |
| Connect frontend too early | Test backend independently first |

## 38. When You Are Ready For CRUD

Only after `GET /api/users` and `GET /api/users/:id` are solid, add write operations.

Recommended order:

| Order | Endpoint | Why |
| --- | --- | --- |
| 1 | `GET /api/users` | Main table data |
| 2 | `GET /api/users/:id` | Simple lookup |
| 3 | `POST /api/users` | Create new data |
| 4 | `PATCH /api/users/:id` | Update existing data |
| 5 | `DELETE /api/users/:id` | Remove data |

Each new write endpoint needs:

| Layer | New responsibility |
| --- | --- |
| Validation | Validate body and params |
| Controller | Read body/params and send response |
| Service | Apply business rules |
| Repository | Save/update/delete data |
| Tests | Prove success and failure cases |

## 39. Your Backend Learning Rule

Do not ask, "What file do I write code in?"

Ask, "Which layer owns this responsibility?"

Then the file becomes obvious.

| Responsibility | Layer |
| --- | --- |
| URL exists | Route |
| HTTP request/response | Controller |
| Rules and decisions | Service |
| Data access | Repository |
| Data shape | Model |
| Bad input | Validation |
| Shared failures | Middleware |
| Environment values | Config |

That is the backend flow you are learning.

## 40. Final Starting Plan

Start with this exact plan:

1. Create `server/`.
2. Set up backend package and TypeScript.
3. Build `app.ts` and `server.ts`.
4. Add `/health`.
5. Create users module.
6. Define the user model.
7. Add mock data.
8. Add repository.
9. Add service.
10. Add validation.
11. Add controller.
12. Add routes.
13. Mount routes under `/api`.
14. Add error handling.
15. Add tests.
16. Only then think about database and frontend integration.

If you follow that order, you will build the backend like a real API instead of a pile of files that only works by accident.
