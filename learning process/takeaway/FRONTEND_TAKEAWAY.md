# Frontend Takeaway

This file explains what the frontend currently does, how it works, why each part exists, and the main keywords to understand.

The frontend is a React + TypeScript app. It renders a users table, fetches users from the backend, and lets the user search, sort, select, add, edit, and delete users in local React state.

Important current limitation:

Add, edit, and delete are not saved to a real database yet. They only change the frontend state while the app is running.

## 1. Current Frontend Folder Structure

```txt
client/src/
  App.tsx
  App.css
  main.tsx
  components/
    container.tsx
    table.tsx
    table-toolbar.tsx
    user-table-header.tsx
    user-table-body.tsx
    user-table-row.tsx
    user-modal.tsx
    delete-confirmation-modal.tsx
  data/
    mockUsers.ts
  helpers/
    formatCurrency.ts
  types/
    user.ts
```

## 2. Big Picture Frontend Flow

Current flow:

```txt
Browser opens app
main.tsx renders App
App fetches users from backend
App passes users into Table
Table stores users in local state
Table renders toolbar, headers, body, rows, and modals
User interactions update local React state
React re-renders the UI
```

Example:

```txt
User clicks a table row
Table saves selectedUserId
The selected row receives selected styling
Edit and Delete buttons become enabled
```

## 3. `main.tsx`

Purpose:

`main.tsx` is the frontend entry point.

It tells React where to mount the app in the browser.

Keyword:

| Keyword | Meaning |
| --- | --- |
| Entry point | The first frontend file that starts the React app |
| Render | Tell React to display components on the page |

Why it matters:

Without `main.tsx`, React has components but nothing starts the app.

## 4. `App.tsx`

Purpose:

`App.tsx` is the top-level component for this project.

Current responsibilities:

| Responsibility | Why |
| --- | --- |
| Store fetched users | The table needs user data |
| Store loading state | The app should show when data is loading |
| Store error state | The app should show when the backend request fails |
| Fetch `/api/users` | Gets users from the backend |
| Render `Container` and `Table` | Builds the main screen |

Important current fetch:

```ts
const response = await fetch("http://localhost:4000/api/users");
```

What happens:

1. The browser sends a `GET` request to the backend.
2. The backend returns JSON.
3. The frontend reads `result.data`.
4. `setUsers(result.data)` stores users in React state.
5. React re-renders the table.

Keywords:

| Keyword | Meaning | Example |
| --- | --- | --- |
| `useState` | Stores changing component data | `const [users, setUsers] = useState([])` |
| `useEffect` | Runs side effects after render | Fetching users from backend |
| `fetch` | Browser API for HTTP requests | `fetch("/api/users")` |
| `async/await` | Waits for asynchronous work | Wait for backend response |
| Loading state | UI state while waiting | `Loading users...` |
| Error state | UI state when something fails | `Failed to fetch users` |

Why `useEffect` is used:

Fetching data is a side effect. It talks to something outside React, so it belongs in `useEffect`.

## 5. `User` Type

File:

```txt
client/src/types/user.ts
```

Current shape:

```ts
export type User = {
  id: number;
  userName: string;
  country: string;
  position: string;
  salary: number;
  department: string;
  yearsOfService: number;
};
```

Purpose:

The `User` type describes what one user object must look like.

Why it matters:

TypeScript can warn you if you try to use a user incorrectly.

Example:

```ts
user.salary
```

TypeScript knows this should be a number.

Keyword:

| Keyword | Meaning |
| --- | --- |
| Type | A TypeScript description of data shape |
| Property | One field on an object, such as `userName` |
| Shared type | A type used by several files |

## 6. `Container`

File:

```txt
client/src/components/container.tsx
```

Purpose:

`Container` wraps page content with a consistent layout class.

Current structure:

```tsx
return <div className="main">{children}</div>;
```

Keywords:

| Keyword | Meaning |
| --- | --- |
| `children` | The content placed inside a component |
| Wrapper component | A component used to provide shared layout |

Example:

```tsx
<Container>
  <Table users={users} />
</Container>
```

## 7. `Table`

File:

```txt
client/src/components/table.tsx
```

Purpose:

`Table` is the main stateful frontend component.

It controls:

| State | Meaning |
| --- | --- |
| `sortedUsers` | The current users displayed by the table |
| `ascending` | Whether sorting is currently ascending or descending |
| `search` | Text typed into the search input |
| `sortColumn` | The column currently being sorted |
| `selectedUserId` | Which row is selected |
| `isModalOpen` | Whether the add/edit modal is open |
| `modalMode` | Whether the modal is in add or edit mode |
| `formValues` | Current values in the modal form |
| `isDeleteModalOpen` | Whether the delete confirmation popup is open |

Why this file has the most logic:

The table is where most user interactions happen.

Current local data flow:

```txt
App passes users prop
Table copies users into sortedUsers state
Search filters sortedUsers
Sort changes sortedUsers order
Add/edit/delete update sortedUsers
Rows render from filteredUsers
```

Important current limitation:

`sortedUsers` is local state. If you refresh the browser, locally added/edited/deleted users are lost.

## 8. Search

Current behavior:

The search input stores text in `search`.

Then the table filters users:

```ts
Object.values(user).some((value) =>
  String(value).toLowerCase().includes(search.toLowerCase()),
)
```

What this means:

| Part | Meaning |
| --- | --- |
| `Object.values(user)` | Get every value from a user object |
| `String(value)` | Convert each value to text |
| `toLowerCase()` | Make search case-insensitive |
| `includes(...)` | Check if the value contains the search text |
| `some(...)` | Return true if at least one field matches |

Example:

If search is `brazil`, a user with `country: "Brazil"` will match.

Why:

This makes search simple and broad. It searches name, country, position, salary, department, and years of service.

## 9. Sorting

Current behavior:

Clicking a table header calls:

```ts
sortBy(column.key)
```

The sort function checks whether the field is a number or string.

| Field type | Sort method |
| --- | --- |
| Number | Subtract values |
| String | Use `localeCompare` |

Example number sort:

```ts
a.salary - b.salary
```

Example string sort:

```ts
a.userName.localeCompare(b.userName)
```

Keywords:

| Keyword | Meaning |
| --- | --- |
| Sort | Reorder items |
| Ascending | Small to large, A to Z |
| Descending | Large to small, Z to A |
| `localeCompare` | Compares strings in a language-aware way |

## 10. Row Selection

Current behavior:

Clicking a row stores the user id:

```ts
setSelectedUserId(user.id)
```

The selected row is found with:

```ts
const selectedUser = sortedUsers.find((user) => user.id === selectedUserId);
```

Why store the id instead of the whole user:

The id is the stable identity of a user. The selected user can always be looked up from the current array.

Keyword:

| Keyword | Meaning |
| --- | --- |
| Selected state | State that remembers what the user clicked |
| Id | Unique identifier for one record |

## 11. Add And Edit Modal

File:

```txt
client/src/components/user-modal.tsx
```

Purpose:

The same modal component is reused for adding and editing.

Type:

```ts
export type UserModalMode = "add" | "edit";
```

Why:

Add and edit forms are almost the same. Reusing one component avoids duplicate form code.

Current add behavior:

```txt
User clicks Add
Table opens modal in add mode
User submits form
Frontend creates the next id
New user is added to sortedUsers
```

Current edit behavior:

```txt
User selects a row
User clicks Edit
Table opens modal in edit mode
Form starts with selected user values
User submits form
Frontend replaces the matching user in sortedUsers
```

Important future change:

When a real database is connected, the frontend should not create ids. The backend/database should create ids.

## 12. Delete Confirmation Modal

File:

```txt
client/src/components/delete-confirmation-modal.tsx
```

Purpose:

Shows a confirmation popup before deleting a user.

Why:

Delete is destructive. A confirmation modal prevents accidental removal.

Current delete behavior:

```txt
User selects row
User clicks Delete
Confirmation modal opens
User clicks Yes
Frontend removes user from sortedUsers
```

Future backend behavior:

```txt
User clicks Yes
Frontend sends DELETE /api/users/:id
Backend deletes database row
Frontend refreshes table
```

## 13. Table Rendering Components

The table is split into smaller rendering components.

| Component | Purpose |
| --- | --- |
| `TableToolbar` | Search input and Add/Edit/Delete buttons |
| `UserTableHeader` | Column headings and sort clicks |
| `UserTableBody` | Maps users into rows |
| `UserTableRow` | Renders one user row |

Why split them:

Smaller components are easier to read, test, and change.

Example:

`UserTableRow` only cares about displaying one user. It does not need to know how fetching works.

## 14. Formatting Salary

File:

```txt
client/src/helpers/formatCurrency.ts
```

Purpose:

Formats a number as GBP currency.

Example:

```ts
formatCurrency(12000)
```

Result:

```txt
£12,000.00
```

Keyword:

| Keyword | Meaning |
| --- | --- |
| Helper function | A reusable function for a small repeated job |
| `Intl.NumberFormat` | Built-in JavaScript formatting API |

## 15. Props

Props are values passed from a parent component to a child component.

Example:

```tsx
<Table users={users} />
```

Here:

| Part | Meaning |
| --- | --- |
| `App` | Parent |
| `Table` | Child |
| `users` | Prop |

Why props matter:

They let components communicate without every component owning the same state.

## 16. State

State is data that changes over time and causes the UI to re-render.

Example:

```ts
const [search, setSearch] = useState("");
```

When `setSearch` runs:

1. React stores the new search value.
2. React re-renders the component.
3. The filtered table updates.

Why state matters:

Most frontend interactivity is state changing over time.

## 17. Current Frontend Strengths

| Strength | Why it is good |
| --- | --- |
| Shared `User` type | Keeps the data shape clear |
| Components are split | Easier to understand each UI area |
| Modal is reused for add/edit | Avoids duplicated forms |
| Delete has confirmation | Safer user experience |
| Backend fetch already exists | Ready for stronger API integration |

## 18. Current Frontend Gaps

| Gap | Why it matters |
| --- | --- |
| Add/edit/delete are local only | Changes disappear on refresh |
| Frontend still does local search/sort | Server pagination will need backend search/sort |
| No pagination controls yet | Backend already supports pagination but UI does not |
| Backend URL is hardcoded | Later this should move to config/env |
| No frontend API layer yet | Fetch logic should eventually move out of `App.tsx` |

## 19. Best Next Frontend Steps

Recommended order:

1. Add a typed paginated API response.
2. Add `page`, `limit`, and `meta` state in `App.tsx`.
3. Create a `PaginationControls` component.
4. Fetch users with `page` and `limit` query params.
5. Move frontend search and sort into backend query params.
6. Create `client/src/api/users-api.ts`.
7. Connect add, edit, and delete to backend routes after the backend supports them.

Main lesson:

The frontend should focus on user interaction and display. The backend should own persistence, validation, and long-term data changes.
