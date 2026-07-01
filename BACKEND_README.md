# Backend API Learning Guide

This project is currently a small React + TypeScript frontend that renders users from local mock data. The backend learning goal is to understand how that local data can become a real API without losing the clean shape of the current app.

No backend code has been added here. This README is a step-by-step guide for learning what to build, why each part exists, and how a senior engineer would structure the system for a junior developer.

## 1. What This Project Has Today

The frontend currently works like this:

| Area | Current file | Current responsibility |
| --- | --- | --- |
| App entry | `src/App.tsx` | Loads `mockUsers` and passes them to the table |
| Data source | `src/data/mockUsers.ts` | Holds the `User` type and fake user records |
| UI table | `src/components/table.tsx` | Displays users, searches locally, sorts locally |
| Formatting helper | `src/helpers/formatCurrency.ts` | Formats salary as GBP currency |

Right now, the frontend owns all the data. A backend API would move the source of truth out of `mockUsers.ts` and into a server.

Think of the current `mockUsers.ts` file as your first temporary database.

## 2. Backend Goal

The backend should answer this question:

How can the frontend ask for users from a server instead of importing an array from a file?

The first backend version should support:

| Feature | Why it matters |
| --- | --- |
| List users | The table needs rows to render |
| Search users | The search box should eventually ask the server for matching users |
| Sort users | Sorting can move from the browser to the API |
| Pagination | Real APIs should not return unlimited records |
| Validation | The server should reject invalid requests clearly |
| Consistent errors | The frontend should know what went wrong |
| Tests | The API should be safe to change |

Start read-only first. Create, update, and delete can come later.

## 3. Recommended Backend Stack

Because this project already uses TypeScript, the simplest learning path is:

| Tool | Purpose |
| --- | --- |
| Node.js | Runs the backend server |
| TypeScript | Keeps frontend and backend thinking consistent |
| Express or Fastify | Handles HTTP routes |
| Zod | Validates request query params, route params, and request bodies |
| SQLite first | Lightweight database for learning |
| PostgreSQL later | Production-style relational database |
| Prisma or Drizzle | Database access layer |
| Vitest or Jest | Unit tests |
| Supertest or Fastify inject | API endpoint tests |
| OpenAPI | Documents the API contract |

For learning, I would choose Node.js, TypeScript, Express, Zod, SQLite, and Prisma first. That gives you enough professional structure without making the project feel heavy.

## 4. The Best Design Pattern For This Project

Use a layered architecture.

Layered architecture means each part of the backend has one job. The request travels through clear layers instead of mixing everything in one file.

| Layer | Job | Example responsibility |
| --- | --- | --- |
| Route | Defines the URL and HTTP method | `GET /api/users` exists |
| Controller | Reads the request and sends the response | Gets query params and calls the service |
| Service | Holds business rules | Decides how searching, sorting, and pagination should work |
| Repository | Talks to the data source | Reads users from memory, SQLite, or PostgreSQL |
| Model | Defines the data shape | A user has id, userName, country, position, salary, department, yearsOfService |
| Validation | Protects the app from bad input | Rejects invalid sort fields or negative page numbers |
| Middleware | Shared request behavior | Logging, CORS, error handling |
| Config | Environment settings | Port, database URL, allowed frontend origin |

The dependency direction should be:

Request -> Route -> Controller -> Service -> Repository -> Database

The response comes back in the opposite direction:

Database -> Repository -> Service -> Controller -> Route -> Client

The most important rule: controllers should be thin, services should contain the decisions, and repositories should hide storage details.

## 5. Why Not Put Everything In One File?

For a tiny project, one file might work. But it teaches bad habits quickly.

If search logic, database access, validation, and response formatting are all mixed together, every change becomes risky. A layered structure helps you replace parts independently.

For example:

| Change | What should change |
| --- | --- |
| Replace mock data with SQLite | Repository only |
| Change search behavior | Service only |
| Add request validation | Validation layer and controller only |
| Change API response format | Controller only |
| Add a new database | Repository and config only |

This is why senior engineers care about structure even in small projects. Small projects are where you train your instincts.

## 6. Future Backend Folder Structure

If you later create a backend folder, a clean structure would look like this:

| Path | Purpose |
| --- | --- |
| `server/src/app` | Builds the server app and connects routes/middleware |
| `server/src/server` | Starts listening on a port |
| `server/src/config` | Reads environment variables |
| `server/src/modules/users` | Keeps all user feature code together |
| `server/src/modules/users/user.model` | User types and data shape |
| `server/src/modules/users/user.routes` | User API routes |
| `server/src/modules/users/user.controller` | Request and response handling |
| `server/src/modules/users/user.service` | Business rules |
| `server/src/modules/users/user.repository` | Database/data access |
| `server/src/modules/users/user.validation` | Query/body validation rules |
| `server/src/middleware` | Error handling, logging, CORS |
| `server/src/shared` | Shared helpers, response types, common errors |
| `server/tests` | Backend tests |

This is feature-first structure. The users feature owns its own route, controller, service, repository, model, and validation files.

Feature-first is usually better than separating everything globally by technical type, because related files stay together.

## 7. The User Data Model

The current frontend user shape is:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | number | Unique user identifier |
| `userName` | string | Display name |
| `country` | string | User country |
| `position` | string | Job title or role |
| `salary` | number | Salary amount |
| `department` | string | Department name |
| `yearsOfService` | number | How long the user has worked |

The backend should treat this as the contract with the frontend.

Before you build routes, decide:

| Decision | Recommended answer for this project |
| --- | --- |
| Should `id` be generated by the backend? | Yes |
| Should salary be stored as a number? | Yes, but be careful with money in real apps |
| Should `userName` be required? | Yes |
| Should `salary` allow negative values? | No |
| Should `yearsOfService` allow negative values? | No |
| Should search check all fields? | For this learning app, yes |

## 8. API Contract

An API contract is the agreement between frontend and backend. The frontend should know what it can request and what the server will return.

Start with these endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/users` | Get a list of users |
| GET | `/api/users/:id` | Get one user by id |

Later, add these:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/users` | Create a user |
| PATCH | `/api/users/:id` | Update part of a user |
| DELETE | `/api/users/:id` | Delete a user |

For this table project, `GET /api/users` is the most important endpoint.

Recommended query params for `GET /api/users`:

| Query param | Example value | Purpose |
| --- | --- | --- |
| `search` | `luis` | Filters users by text |
| `sortBy` | `salary` | Chooses the field to sort |
| `order` | `asc` or `desc` | Chooses sort direction |
| `page` | `1` | Chooses result page |
| `limit` | `10` | Chooses how many records per page |

Recommended successful response shape:

| Field | Meaning |
| --- | --- |
| `data` | The list of users |
| `meta.page` | Current page |
| `meta.limit` | Number of users per page |
| `meta.total` | Total matching users |
| `meta.totalPages` | Total number of pages |

Recommended error response shape:

| Field | Meaning |
| --- | --- |
| `error.message` | Human-readable message |
| `error.code` | Stable machine-readable error code |
| `error.details` | Optional validation details |

Consistent response shapes make frontend work much easier.

## 9. Step-By-Step Learning Path

### Step 1: Understand The Current Frontend Data Flow

Current flow:

1. `App.tsx` imports `mockUsers`.
2. `App.tsx` passes users into `Table`.
3. `Table` stores users in React state.
4. `Table` filters and sorts users in the browser.
5. The browser renders the rows.

Backend version:

1. `App.tsx` asks the backend for users.
2. Backend reads users from a data source.
3. Backend applies search, sort, and pagination.
4. Backend returns a response.
5. Frontend renders the returned users.

The big learning idea: data stops being imported and starts being requested.

### Step 2: Learn HTTP Before Frameworks

Before writing backend files, understand these basics:

| Concept | Meaning |
| --- | --- |
| Client | The frontend/browser making the request |
| Server | The backend answering the request |
| Request | What the client sends |
| Response | What the server sends back |
| Method | The action, like GET or POST |
| URL | The resource address |
| Status code | The result of the request |
| Body | Data sent with the request or response |
| Query params | Filters/options in the URL |
| Headers | Metadata about the request |

Important status codes:

| Status | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 204 | Success with no response body |
| 400 | Bad request |
| 404 | Not found |
| 409 | Conflict |
| 422 | Validation error |
| 500 | Server error |

### Step 3: Define The Resource

Your first resource is `users`.

A resource is a thing your API manages. In this project, the table displays users, searches users, and sorts users. That means users are the central backend resource.

Do not start by thinking about Express, Prisma, or database tables. Start by asking:

What can the client do with users?

For this app, the answer is:

| Capability | Needed now? |
| --- | --- |
| List users | Yes |
| Search users | Yes |
| Sort users | Yes |
| Paginate users | Yes |
| View one user | Useful |
| Create user | Later |
| Edit user | Later |
| Delete user | Later |

### Step 4: Start With A Read-Only API

Build the smallest useful backend first.

Read-only means the API can return users but cannot yet change users. This lets you learn routing, controllers, services, repositories, and validation without also learning database writes.

The first milestone should be:

| Milestone | Done when |
| --- | --- |
| Server starts | You can visit a health endpoint |
| Users route exists | The frontend or browser can request users |
| Mock data is returned | The API returns the same users currently in `mockUsers.ts` |
| Search works | The API can filter users |
| Sort works | The API can sort users |
| Pagination works | The API returns a limited page of users |

### Step 5: Add Validation

Validation means checking input before your app trusts it.

Examples of invalid input:

| Bad request | Why it is bad |
| --- | --- |
| `page=-1` | Page cannot be negative |
| `limit=abc` | Limit must be a number |
| `sortBy=password` | That field does not exist or should not be sortable |
| `order=random` | Only `asc` or `desc` should be accepted |

Validation should happen before the service receives data.

The service should receive clean, predictable values. That keeps business logic simple.

### Step 6: Move Business Rules Into The Service

The service layer answers business questions.

For this project:

| Question | Service responsibility |
| --- | --- |
| How should users be searched? | Decide which fields are searchable |
| How should sorting work? | Decide allowed sort fields |
| What is the default sort order? | Decide default behavior |
| How should pagination work? | Decide default page and limit |
| What happens if no users match? | Return an empty list, not an error |

Keep these decisions out of the controller.

The controller should not know how search works. It should only pass the request into the service and return the result.

### Step 7: Hide Data Access In The Repository

The repository layer answers storage questions.

For this project:

| Question | Repository responsibility |
| --- | --- |
| Where do users come from? | Mock array, SQLite, or PostgreSQL |
| How do we find one user by id? | Data lookup |
| How do we list users? | Data query |
| How do we save a user later? | Data write |

At first, the repository could read from in-memory data. Later, it can read from a database.

The service should not care which one is being used.

This is one of the main benefits of the repository pattern.

### Step 8: Add A Database Later

Once the API works with mock data, move to a database.

For learning, use SQLite first:

| Reason | Benefit |
| --- | --- |
| No separate database server | Easier setup |
| File-based | Simple to inspect and reset |
| SQL-based | Teaches real database thinking |
| Works with Prisma/Drizzle | Easy migration path |

After SQLite feels comfortable, learn PostgreSQL.

Database table design for users:

| Column | Type idea | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `user_name` | text | Required |
| `country` | text | Required |
| `position` | text | Required |
| `salary` | integer or decimal | Required |
| `department` | text | Required |
| `years_of_service` | integer | Required |
| `created_at` | date/time | Useful for real systems |
| `updated_at` | date/time | Useful for real systems |

Notice that database naming often uses `snake_case`, while TypeScript often uses `camelCase`. Your repository or ORM can map between them.

### Step 9: Add Error Handling

Good APIs fail clearly.

Recommended error categories:

| Error type | Example |
| --- | --- |
| Validation error | Invalid `sortBy` query param |
| Not found error | User id does not exist |
| Conflict error | Email already exists, if email is added later |
| Unexpected error | Database connection fails |

Do not leak internal details to the frontend. A database error should not expose private stack traces in production.

### Step 10: Connect The Frontend

When the backend exists, the frontend data flow changes.

Current frontend:

| Current behavior | Future behavior |
| --- | --- |
| Imports `mockUsers` | Requests `/api/users` |
| Sorts all data locally | Sends `sortBy` and `order` query params |
| Searches all data locally | Sends `search` query param |
| Holds all users in browser memory | Holds one page or result set |

For a small table, local search is fine. For real APIs, server-side search and pagination are better because the browser should not load every record.

### Step 11: Test Each Layer

Testing should match the architecture.

| Test type | What it checks |
| --- | --- |
| Service unit tests | Search, sort, pagination rules |
| Repository tests | Data access works |
| Controller/API tests | HTTP status codes and response shapes |
| Validation tests | Bad input is rejected |
| Frontend integration tests | The table renders API data |

Start with service tests. They are fast and teach you how business logic behaves.

Then add API tests. They prove the whole backend request flow works.

### Step 12: Document The API

Backend APIs should be documented.

At minimum, document:

| Documentation item | Why |
| --- | --- |
| Endpoint URL | Frontend needs to know where to call |
| HTTP method | Defines the action |
| Query params | Defines filtering/sorting options |
| Request body | Needed for create/update later |
| Success response | Frontend needs the data shape |
| Error response | Frontend needs error handling |
| Status codes | Frontend needs behavior expectations |

Later, use OpenAPI/Swagger for interactive API docs.

## 10. Backend Request Flow Example

Imagine the frontend asks for users with search text `manager`, sorted by salary descending.

The backend flow should be:

1. Route receives `GET /api/users`.
2. Validation checks query params.
3. Controller extracts validated query params.
4. Controller calls the users service.
5. Service decides search, sort, and pagination rules.
6. Service asks repository for matching data.
7. Repository reads from the data source.
8. Service prepares the result and metadata.
9. Controller sends a consistent response.
10. Frontend renders the table.

This flow is the backbone of most REST APIs.

## 11. Search And Sort Design

The current frontend searches through all object values. That is good for a learning table, but the backend should be more intentional.

Recommended searchable fields:

| Field | Searchable? |
| --- | --- |
| `userName` | Yes |
| `country` | Yes |
| `position` | Yes |
| `department` | Yes |
| `salary` | Maybe, but not first |
| `yearsOfService` | Maybe, but not first |
| `id` | Maybe, but exact match is better |

Recommended sortable fields:

| Field | Sortable? |
| --- | --- |
| `id` | Yes |
| `userName` | Yes |
| `country` | Yes |
| `position` | Yes |
| `salary` | Yes |
| `department` | Yes |
| `yearsOfService` | Yes |

Always whitelist sortable fields. Never blindly trust a client-provided field name.

## 12. Pagination Design

Pagination protects the backend and frontend from huge responses.

Recommended defaults:

| Option | Value |
| --- | --- |
| Default page | 1 |
| Default limit | 10 |
| Maximum limit | 100 |
| Empty result | Return empty `data` array |

Why this matters:

| Without pagination | With pagination |
| --- | --- |
| Large responses get slow | Responses stay small |
| Browser memory grows | Browser handles small result sets |
| Database queries can become expensive | Query size is controlled |

## 13. Security Basics

Even a learning backend should build good habits.

| Concern | What to do |
| --- | --- |
| CORS | Allow the Vite frontend origin during development |
| Validation | Validate all input |
| Error messages | Do not expose private internals |
| Environment variables | Keep secrets out of source code |
| Rate limiting | Add later if public |
| Authentication | Add later if users become private |
| Authorization | Add later if different roles can do different actions |

Authentication answers: who are you?

Authorization answers: what are you allowed to do?

They are related, but not the same.

## 14. Environment Configuration

The backend should not hard-code environment-specific settings.

Recommended config values:

| Name | Meaning |
| --- | --- |
| `PORT` | Backend server port |
| `DATABASE_URL` | Database connection string |
| `FRONTEND_ORIGIN` | Allowed frontend URL for CORS |
| `NODE_ENV` | Development, test, or production mode |

For learning, keep config simple. But understand the idea early: code should stay the same when settings change.

## 15. Suggested Build Order

Follow this order when you eventually implement the backend:

1. Create backend project setup.
2. Add server startup.
3. Add health endpoint.
4. Add users module.
5. Add users route.
6. Add users controller.
7. Add users service.
8. Add users repository using mock data.
9. Add validation for query params.
10. Add search.
11. Add sort.
12. Add pagination.
13. Add API tests.
14. Connect frontend to API.
15. Replace mock repository with SQLite.
16. Add database migrations.
17. Add create/update/delete only after read flow is solid.

This order keeps the learning curve smooth.

## 16. Senior-To-Junior Mental Model

When you build backend APIs, keep asking these questions:

| Question | Good answer |
| --- | --- |
| What resource am I exposing? | Users |
| What does the client need? | A searchable, sortable user list |
| What should the client never control? | Internal database behavior |
| Where does validation live? | Before business logic |
| Where does business logic live? | Service layer |
| Where does database access live? | Repository layer |
| How do errors look? | Consistent response shape |
| How do I know it works? | Tests at service and API levels |

Good backend engineering is mostly about boundaries.

Each layer should know only what it needs to know.

## 17. Practical Exercises

Use these exercises when you are ready to implement the backend later:

| Exercise | Goal |
| --- | --- |
| Draw the request flow | Explain route, controller, service, repository |
| Write the API contract first | Decide endpoint behavior before coding |
| Build read-only users endpoint | Return user list from mock data |
| Add query validation | Reject invalid search/sort/page values |
| Move sorting to backend | Let API sort instead of table component |
| Add pagination | Return page metadata |
| Add service tests | Prove search/sort rules work |
| Add API tests | Prove HTTP responses work |
| Replace mock data with SQLite | Learn persistence |
| Add OpenAPI docs | Make the API easy to understand |

## 18. What Good Looks Like

A good first backend for this project should be:

| Quality | Meaning |
| --- | --- |
| Small | Only users API at first |
| Typed | TypeScript data shapes are clear |
| Layered | Route, controller, service, repository are separate |
| Validated | Bad requests are rejected early |
| Tested | Search, sort, and pagination are covered |
| Documented | Endpoint behavior is easy to understand |
| Replaceable | Mock data can become a database without rewriting everything |

If you can explain why each layer exists, you are learning backend engineering the right way.

## 19. Glossary

| Term | Meaning |
| --- | --- |
| API | A contract that lets software talk to software |
| REST | A common style for HTTP APIs built around resources |
| Endpoint | A URL and method combination |
| Route | The backend mapping for an endpoint |
| Controller | Handles request and response details |
| Service | Contains business rules |
| Repository | Handles data access |
| Model | Defines the shape of data |
| DTO | Data Transfer Object, the shape passed across a boundary |
| Validation | Checking input before using it |
| Middleware | Shared logic that runs during request handling |
| Database migration | A controlled change to database structure |
| ORM | A tool that helps code work with a database |
| CORS | Browser security rule controlling cross-origin requests |
| Pagination | Splitting large results into pages |

## 20. Final Learning Advice

Do not rush into database work first.

Learn the request flow first:

1. Request comes in.
2. Input is validated.
3. Controller calls service.
4. Service applies rules.
5. Repository gets data.
6. Response goes out.

Once that flow feels natural, databases, authentication, deployment, and testing become much easier to reason about.

This project is a good size for learning because the data shape is simple, the UI goal is clear, and the next backend step is obvious: replace local mock users with a real users API.
