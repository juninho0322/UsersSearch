# Frontend Learning Notes

This file explains how the React frontend works, how the code is structured, and why the main pieces exist.

## Frontend Goal

The frontend is responsible for the user interface:

1. Show users in a table.
2. Let the user search the users currently visible on the current page.
3. Let the user sort the users currently visible on the current page.
4. Let the user create, edit, and delete users.
5. Talk to the backend API, not directly to Supabase.

The frontend should not know the Supabase service role key. That secret belongs only on the backend.

## Folder Structure

```text
client/src/
  App.tsx
  App.css
  index.css
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
  helpers/
    formatCurrency.ts
  services/
    users-api.ts
  types/
    user.ts
```

## Entry Point

`main.tsx` starts the React app and renders `App`.

`App.tsx` is the top-level application component. It owns the main API state:

- `users`
- `pagination`
- `isLoading`
- `isMutating`
- `error`
- `search`
- `page`
- `sortColumn`
- `sortOrder`

The reason this state lives in `App.tsx` is that it controls the whole table experience and needs to be passed into the table component.

## API Service

`services/users-api.ts` contains all frontend HTTP calls.

It has functions for:

- `listUsers`
- `createUser`
- `updateUser`
- `deleteUser`

This keeps fetch logic out of the UI components. The components should not need to know how URLs are built, how JSON is parsed, or how API errors are extracted.

The API base URL comes from:

```text
VITE_API_URL
```

If the env variable is missing, the fallback is:

```text
http://localhost:4000
```

## Table Flow

`App.tsx` fetches a page of users from the backend.

Then `Table` receives:

- the users for the current page
- the current search text
- the current sort column
- the current sort direction
- pagination metadata
- mutation handlers

The important design decision is:

Search and sort happen only on the current page of users.

That means:

- Pagination fetches a page from the backend.
- Search filters only the users already loaded for that page.
- Sort sorts only the users already loaded for that page.

This avoids the bug where sorting page 2 caused users from page 1 to appear.

## Search Logic

Search is stored in `App.tsx`, but filtering happens in `Table`.

Inside `Table`, `visibleUsers` is calculated with `useMemo`.

The search checks every value on the user object:

```ts
Object.values(user).some((value) =>
  String(value).toLowerCase().includes(searchText),
)
```

Why `useMemo`?

It avoids recalculating the filtered and sorted list unless one of these changes:

- `search`
- `sortColumn`
- `sortOrder`
- `users`

## Sort Logic

The table header calls `onSort(column)`.

`App.tsx` decides whether to:

- switch to a new column and use ascending order
- or toggle the current column between ascending and descending

Then `Table` sorts only the current page's users.

String fields use `localeCompare`.

Number fields use subtraction.

## Form State

The add/edit modal uses `UserFormValues`.

The important part is that `salary` and `yearsOfService` are stored as strings while the user is typing.

That solves the old issue where `0` could not be deleted.

Why it happened before:

1. The input value was stored as a number.
2. When the user deleted the input, the browser produced an empty string.
3. The code converted the empty string with `Number("")`.
4. `Number("")` is `0`.
5. React put `0` straight back into the input.

The new approach:

1. Keep the input value as text while typing.
2. Allow empty values while editing.
3. Apply a simple mask to remove invalid characters.
4. Convert the text to a real number only when the form is submitted.

## Number Masks

Salary:

- allows digits
- allows one decimal point
- keeps up to two decimal places
- blocks `e`, `E`, `+`, and `-`

Years of service:

- allows digits only
- blocks decimal points and letters
- converts to a whole number on submit

Validation before sending to the API:

- salary is required
- salary must be a valid number
- years of service is required
- years of service must be an integer from 0 to 80

## Create User Flow

1. User clicks `Add`.
2. `Table` opens `UserModal`.
3. User fills the form.
4. `saveUser` converts the form draft into `UserInput`.
5. `onAddUser` is called.
6. `App.tsx` calls `createUser`.
7. `users-api.ts` sends `POST /api/users`.
8. Backend creates the row in Supabase.
9. Frontend refreshes page 1.
10. Modal closes only after the API succeeds.

If the API fails, the modal stays open and shows the error.

## Edit User Flow

1. User selects a table row.
2. User clicks `Edit`.
3. `Table` copies the selected user's values into the form.
4. Number fields are converted to strings for editing.
5. User saves changes.
6. `App.tsx` calls `updateUser`.
7. `users-api.ts` sends `PATCH /api/users/:id`.
8. Frontend refreshes the current page.

## Delete User Flow

1. User selects a table row.
2. User clicks `Delete`.
3. Confirmation modal opens.
4. User confirms.
5. `App.tsx` calls `deleteUser`.
6. `users-api.ts` sends `DELETE /api/users/:id`.
7. Frontend refreshes the current page.

If the current page becomes empty after deleting the last row, the app goes back one page.

## Error Handling

The API service reads the backend error response and tries to show the most useful message.

It checks:

1. Zod field errors.
2. Zod form errors.
3. Database error details.
4. Generic backend message.
5. Fallback text.

This is why database problems like a broken Supabase sequence can be shown more clearly in the UI.

## Styling

`index.css` defines the global dark theme tokens:

- text colors
- background colors
- borders
- accent colors
- danger colors
- shadows

`App.css` defines the actual layout and component styling:

- table
- toolbar
- buttons
- modal
- form
- pagination
- error messages

Keeping theme tokens separate from component styles makes it easier to change the look later.

## Important Frontend Lessons

1. Keep API code out of UI components.
2. Keep form draft state flexible while users type.
3. Convert and validate form data before sending it to the backend.
4. Do not refetch data for purely local actions like current-page search and sort.
5. Show errors close to the action that caused them.
6. Keep secrets out of the frontend.
