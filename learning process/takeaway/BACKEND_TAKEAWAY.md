# Backend Takeaway

This file explains what the backend currently does, how it works, why each part exists, and the main keywords to understand.

The backend is a Node.js + Express + TypeScript API. It currently returns users from mock data and supports list users with search, sort, and pagination.

Important current limitation:

The backend does not use a real database yet. The repository still reads from `user.mock-data.ts`.

## 1. Current Backend Folder Structure

```txt
server/
  package.json
  tsconfig.json
  .env
  .env.example
  src/
    app.ts
    server.ts
    config/
      env.ts
    middleware/
      error.middleware.ts
      not-found.middleware.ts
    modules/
      users/
        user.controller.ts
        user.mock-data.ts
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

## 2. Big Picture Backend Flow

Current request flow:

```txt
Frontend calls GET /api/users
app.ts sends request to apiRouter
apiRouter sends /users request to userRouter
user.routes.ts calls user.controller.ts
controller validates query params
controller calls user.service.ts
service gets mock users from repository
service applies search, sort, and pagination
controller returns JSON response
```

Short version:

```txt
Request -> Route -> Controller -> Validation -> Service -> Repository -> Mock Data
```

Why this structure matters:

Each layer has one job. That makes the backend easier to change later.

## 3. Backend Package

File:

```txt
server/package.json
```

Current important dependencies:

| Package | Purpose |
| --- | --- |
| `express` | Creates HTTP server routes and middleware |
| `cors` | Allows the frontend to call the backend |
| `dotenv` | Loads `.env` variables |
| `zod` | Validates request data |
| `tsx` | Runs TypeScript directly in development |
| `typescript` | Compiles TypeScript |
| `vitest` | Test runner |
| `supertest` | Tests HTTP endpoints |

Current scripts:

| Script | Meaning |
| --- | --- |
| `npm run dev` | Start backend in watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled backend |
| `npm test` | Run tests |

## 4. `server.ts`

File:

```txt
server/src/server.ts
```

Purpose:

Starts the backend server.

Current flow:

```txt
Import app
Import env
Listen on env.PORT
Log server start message
```

Keyword:

| Keyword | Meaning |
| --- | --- |
| Listen | Open a network port so requests can reach the app |
| Port | Number used by the computer to route traffic to the backend |

Example:

If `PORT=4000`, the backend listens at:

```txt
http://localhost:4000
```

## 5. `app.ts`

File:

```txt
server/src/app.ts
```

Purpose:

Builds the Express app.

Current responsibilities:

| Responsibility | Code idea |
| --- | --- |
| Create Express app | `express()` |
| Read JSON bodies | `app.use(express.json())` |
| Enable CORS | `app.use(cors())` |
| Mount API routes | `app.use("/api", apiRouter)` |
| Add test route | `GET /` |
| Add health route | `GET /health` |
| Handle unknown routes | `notFoundMiddleware` |
| Handle errors | `errorMiddleware` |

Why `app.ts` and `server.ts` are separate:

`app.ts` builds the API. `server.ts` starts the API.

This separation makes testing easier because tests can import `app` without opening a real port.

## 6. Environment Config

File:

```txt
server/src/config/env.ts
```

Purpose:

Loads environment variables and exports a clean config object.

Current config:

```ts
export const env = {
  PORT: Number(process.env.PORT),
};
```

Keyword:

| Keyword | Meaning |
| --- | --- |
| Environment variable | A config value outside the code |
| `.env` | Local file for environment variables |
| Config | Central place where app settings are read |

Why:

The port should not be hardcoded in every file.

## 7. Routes

Files:

```txt
server/src/routes/index.ts
server/src/modules/users/user.routes.ts
```

Purpose:

Routes connect URLs and HTTP methods to controller functions.

Current route:

```txt
GET /api/users
```

How the URL is built:

| File | Route part |
| --- | --- |
| `app.ts` | `/api` |
| `routes/index.ts` | `/users` |
| `user.routes.ts` | `/` |

Together:

```txt
/api + /users + / = /api/users
```

Keywords:

| Keyword | Meaning |
| --- | --- |
| Route | A URL and HTTP method pair |
| Router | A group of related routes |
| HTTP method | The action, such as `GET`, `POST`, `PATCH`, `DELETE` |

## 8. Controller

File:

```txt
server/src/modules/users/user.controller.ts
```

Purpose:

The controller handles HTTP-level work.

Current controller flow:

```txt
Receive Express request
Validate req.query with Zod
Call listUsers service
Return 200 JSON response
Send errors to next(error)
```

Keyword:

| Keyword | Meaning |
| --- | --- |
| Request | Data sent by the client |
| Response | Data sent back by the server |
| Controller | Layer that translates HTTP into service calls |
| `next(error)` | Pass an error to Express error middleware |

Why:

The controller should stay thin. It should not contain search, sort, pagination, or database logic.

## 9. Validation

File:

```txt
server/src/modules/users/user.validation.ts
```

Purpose:

Validates and normalises input before it reaches the service.

Current list users query schema:

| Query param | Rule | Default |
| --- | --- | --- |
| `search` | Optional string | None |
| `sortBy` | Must be a valid user field | `id` |
| `order` | Must be `asc` or `desc` | `asc` |
| `page` | Positive integer | `1` |
| `limit` | Positive integer, max 100 | `10` |

Example valid requests:

```txt
GET /api/users
GET /api/users?page=2&limit=5
GET /api/users?search=luis
GET /api/users?sortBy=salary&order=desc
```

Example invalid request:

```txt
GET /api/users?page=-1
```

Why invalid:

Page must be a positive number.

Keywords:

| Keyword | Meaning |
| --- | --- |
| Zod | Library used to validate data |
| Schema | Rules describing valid data |
| Coerce | Convert one type into another, such as string to number |
| Transform | Change validated data into the shape the app wants |

Important example:

Query params arrive as strings.

```txt
?page=2
```

The backend receives:

```ts
"2"
```

Zod turns it into:

```ts
2
```

## 10. Model

File:

```txt
server/src/modules/users/user.model.ts
```

Purpose:

Defines TypeScript types for the users module.

Current important types:

| Type | Purpose |
| --- | --- |
| `User` | Shape of one user |
| `UserSortField` | Fields allowed for sorting |
| `UserSortOrder` | Sort direction: `asc` or `desc` |
| `ListUsersQuery` | Validated list-users query shape |

Why:

Types keep the backend code honest. If a service expects `page` to be a number, TypeScript helps catch mistakes before runtime.

## 11. Repository

File:

```txt
server/src/modules/users/user.repository.ts
```

Purpose:

The repository is the data access layer.

Current data source:

```txt
server/src/modules/users/user.mock-data.ts
```

Current repository functions:

| Function | Purpose |
| --- | --- |
| `getAllUsers` | Returns all mock users |
| `getUserById` | Finds one mock user by id |
| `getUserCount` | Returns total mock user count |

Keyword:

| Keyword | Meaning |
| --- | --- |
| Repository | Layer that talks to the data source |
| Data source | Where data comes from, currently mock data |
| Mock data | Temporary fake data used before a real database |

Why:

When you later add a database, the repository is the main file that should change.

The controller should not care whether users come from mock data, SQLite, or PostgreSQL.

## 12. Service

File:

```txt
server/src/modules/users/user.service.ts
```

Purpose:

The service contains business logic.

Current service responsibilities:

| Responsibility | Meaning |
| --- | --- |
| Get users | Calls repository |
| Search users | Filters matching records |
| Sort users | Orders records by chosen field |
| Paginate users | Returns only one page |
| Build metadata | Adds `page`, `limit`, `total`, `totalPages` |

Current service flow:

```txt
Get all users from repository
Copy the array
Apply search if query.search exists
Sort by query.sortBy and query.sortOrder
Calculate total and totalPages
Slice the array for the current page
Return data and meta
```

Why the service copies the array:

```ts
let processedUsers = [...allUsers];
```

This avoids changing the original mock data array.

Keyword:

| Keyword | Meaning |
| --- | --- |
| Business logic | App-specific rules and decisions |
| Pagination | Splitting a big list into pages |
| Metadata | Extra information about the response |

## 13. Search Logic

Current backend search checks:

| Field |
| --- |
| `userName` |
| `country` |
| `position` |
| `department` |
| `salary` |
| `yearsOfService` |

Example:

```txt
GET /api/users?search=finance
```

This can match users in the Finance department.

Why:

Search is broad and simple for learning.

## 14. Sort Logic

Current sort fields:

```txt
id
userName
country
position
salary
department
yearsOfService
```

Example:

```txt
GET /api/users?sortBy=salary&order=desc
```

Meaning:

Return users sorted by highest salary first.

Why validation matters:

Without validation, someone could request a field that does not exist.

## 15. Pagination Logic

Current pagination formula:

```ts
const startIndex = (query.page - 1) * query.limit;
const endIndex = startIndex + query.limit;
const paginatedUsers = processedUsers.slice(startIndex, endIndex);
```

Example:

```txt
page = 2
limit = 10
startIndex = 10
endIndex = 20
```

Meaning:

Page 2 returns users 11 to 20.

Metadata example:

```ts
{
  page: 2,
  limit: 10,
  total: 15,
  totalPages: 2
}
```

Why metadata matters:

The frontend needs `totalPages` to know whether the Next button should be disabled.

## 16. API Response Types

File:

```txt
server/src/shared/types/api-response.ts
```

Purpose:

Defines consistent response shapes.

Success response:

```ts
{
  data: T;
  meta?: PaginationMeta;
}
```

Error response:

```ts
{
  error: {
    message: string;
    code: string;
    details?: unknown;
  }
}
```

Why:

The frontend is easier to build when responses are predictable.

## 17. Error Handling

Files:

```txt
server/src/shared/errors/AppError.ts
server/src/middleware/error.middleware.ts
server/src/middleware/not-found.middleware.ts
```

Purpose:

Make backend errors consistent.

Current error behavior:

| Error type | Response |
| --- | --- |
| Zod validation error | `400 VALIDATION_ERROR` |
| AppError | Uses custom status and code |
| Unknown error | `500 INTERNAL_SERVER_ERROR` |
| Unknown route | `404 ROUTE_NOT_FOUND` |

Keyword:

| Keyword | Meaning |
| --- | --- |
| Middleware | Function that runs during the request/response flow |
| Error middleware | Express middleware that handles errors |
| Status code | HTTP number that explains result |

Example:

If the frontend calls:

```txt
GET /api/missing
```

The backend returns a 404 error response.

## 18. CORS

Current code:

```ts
app.use(cors());
```

Purpose:

Allows the frontend running on one origin to call the backend running on another origin.

Example:

| App | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:4000` |

Without CORS, the browser may block frontend requests to the backend.

Keyword:

| Keyword | Meaning |
| --- | --- |
| Origin | Protocol + domain + port |
| CORS | Browser security rule for cross-origin requests |

## 19. Current Backend Strengths

| Strength | Why it is good |
| --- | --- |
| Layered users module | Clear route/controller/service/repository separation |
| Zod validation | Bad query params are rejected early |
| Consistent response types | Frontend has a stable contract |
| Pagination already exists | Ready for frontend pagination controls |
| Error middleware exists | Failures return predictable JSON |
| Config file exists | Environment values are centralized |

## 20. Current Backend Gaps

| Gap | Why it matters |
| --- | --- |
| No real database | Data is still temporary |
| No create route | Frontend add cannot persist |
| No edit route | Frontend edit cannot persist |
| No delete route | Frontend delete cannot persist |
| Search/sort/pagination happen in memory | Database should handle this for large data |
| CORS allows everything | Later it should restrict allowed frontend origins |
| `findUserById` is not exposed as a route yet | `GET /api/users/:id` is still missing |

## 21. Best Next Backend Steps

Recommended order:

1. Add SQLite and Prisma.
2. Create a `User` database table.
3. Seed the database with the current mock users.
4. Replace repository reads with database reads.
5. Keep the same `GET /api/users` response shape.
6. Move search, sort, and pagination into database queries.
7. Add `POST /api/users`.
8. Add `PATCH /api/users/:id`.
9. Add `DELETE /api/users/:id`.
10. Add tests for list, create, edit, delete, validation, and not found cases.

Main lesson:

The backend should own validation, business rules, persistence, and API response shape. The frontend should call the backend and render the result.
