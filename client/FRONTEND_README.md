# Frontend README

This frontend is a React + TypeScript app built with Vite. It displays a users table with search, sorting, row selection, add/edit modal forms, and a delete confirmation popup.

The backend is intentionally not touched by this UI. At the moment, table changes happen in local React state so the backend can later be connected through API calls without changing the component structure.

## How To Run

```bash
npm install
npm run dev
```

The current Vite URL is:

```text
http://127.0.0.1:5173/UsersSearch/
```

Useful checks:

```bash
npm run build
npm run lint
```

## Folder Structure

```text
src/
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

## Architecture Approach

The table is split using a container/presentation style:

`table.tsx` is the stateful controller. It owns table state, selection state, modal state, sorting, filtering, adding, editing, and deleting.

The smaller components focus on rendering:

- `table-toolbar.tsx` renders search, Add, Edit, and Delete buttons.
- `user-table-header.tsx` renders sortable column headers.
- `user-table-body.tsx` maps users into rows.
- `user-table-row.tsx` renders one selectable user row.
- `user-modal.tsx` renders the Add/Edit user form.
- `delete-confirmation-modal.tsx` renders the delete confirmation popup.

This keeps each file small and makes the app easier to change. For example, when the backend is ready, most API work can be added in `table.tsx` or moved into a custom hook without rewriting the row, modal, or toolbar components.

## TypeScript Strategy

There are two kinds of types in this frontend:

Shared domain types live in `src/types`.

`src/types/user.ts` contains the `User` type because many parts of the frontend need the same definition of a user. This is a good use of a shared type file.

Component-only types stay inside the component file.

For example, `TableToolbarProps`, `UserTableRowProps`, and `DeleteConfirmationModalProps` are declared in their own component files because they are not reused anywhere else. Keeping local prop types beside the component makes the code easier to read and avoids creating a large `types.ts` file full of unrelated UI details.

The modal form types live with `user-modal.tsx` because they describe the modal contract:

```ts
export type UserFormValues = Omit<User, "id">;
export type UserModalMode = "add" | "edit";
```

They are exported only because `table.tsx` controls the modal state and needs to create the same form shape.

The rule of thumb used here:

- Shared business/domain data: put it in `src/types`.
- Props used by one component: keep them in that component.
- UI contracts shared by a parent and child: keep them near the child that owns the UI contract, then export them.

## Data Flow

Initial users come from `mockUsers`.

```tsx
<Table users={mockUsers} />
```

Inside `table.tsx`, the prop is copied into local state:

```ts
const [sortedUsers, setSortedUsers] = useState<User[]>(users);
```

That state drives the UI. Add, edit, and delete update this local state.

Later, this can be replaced or extended with backend calls:

- Add: call `POST /users`, then add the returned user to state.
- Edit: call `PUT /users/:id`, then replace the user in state.
- Delete: call `DELETE /users/:id`, then remove the user from state.
- Load: fetch users on page load instead of using `mockUsers`.

## Search

Search is controlled by the `search` state in `table.tsx`.

The filter checks every value in a user object:

```ts
Object.values(user).some((value) =>
  String(value).toLowerCase().includes(search.toLowerCase()),
)
```

This makes the search broad and simple: name, country, salary, department, and years of service can all match.

## Sorting

Clicking a table header calls `sortBy`.

The sort function supports both numbers and strings:

- Number fields use numeric comparison.
- Text fields use `localeCompare`.

The app tracks:

- `sortColumn`: which column is currently sorted.
- `ascending`: whether the next direction is ascending or descending.

The header component receives those values and shows the arrow beside the active column.

## Row Selection

Rows are selectable by clicking anywhere on the row.

The selected user is tracked by id:

```ts
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
```

The selected row receives the `selected-row` class and the Edit/Delete buttons become enabled.

Selection clears when the user clicks outside the table and outside the action buttons. This prevents stale selection from hanging around when the user has moved away from the table.

## Add And Edit Modal

The same `UserModal` component handles both Add and Edit.

The difference is controlled by:

```ts
type UserModalMode = "add" | "edit";
```

For Add:

- Empty form values are loaded.
- A new id is generated locally.
- The new user is appended to state.

For Edit:

- The selected user values are loaded into the form.
- Saving replaces the matching user in state.

This avoids duplicating two very similar modal forms.

## Delete Confirmation

Clicking Delete opens `DeleteConfirmationModal`.

The popup shows the selected user id and name:

```text
Are you sure you want to delete user #1 - Luis?
```

The actions are:

- `No`: closes the popup and keeps the user.
- `Yes`: removes the selected user and clears selection.

This is safer than deleting immediately because the user gets a clear final check before destructive action.

## Styling Approach

Styles currently live in `App.css` because the app is small. Class names are kept explicit and tied to UI responsibility:

- `.table-toolbar`
- `.action-buttons`
- `.selected-row`
- `.user-modal`
- `.delete-modal`
- `.modal-actions`

For a larger app, the next step would be either CSS modules per component or a dedicated component styling system. For this size, one stylesheet is still easy to follow.

## Senior Scalability Notes

The current structure is intentionally simple but leaves clean growth paths:

- Move table state into a custom hook such as `useUsersTable` when logic grows.
- Replace `mockUsers` with an API service layer when the backend is ready.
- Keep reusable domain types in `src/types`.
- Keep component prop types colocated with the component.
- Keep destructive actions behind confirmation modals.
- Keep rendering components stateless where possible.

This gives the project a clean frontend foundation without making it complicated before it needs to be.
