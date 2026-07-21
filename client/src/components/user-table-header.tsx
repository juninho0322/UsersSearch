import type { User } from "../types/user";

type UserTableHeaderProps = {
  sortColumn: keyof User;
  ascending: boolean;
  onSort: (key: keyof User) => void;
};

const columns: Array<{ key: keyof User; label: string }> = [
  { key: "id", label: "Id" },
  { key: "userName", label: "Name" },
  { key: "position", label: "Position" },
  { key: "salary", label: "Salary" },
  { key: "country", label: "Country" },
  { key: "department", label: "Department" },
  { key: "yearsOfService", label: "Years Service" },
];

export function UserTableHeader({
  sortColumn,
  ascending,
  onSort,
}: UserTableHeaderProps) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            aria-sort={
              sortColumn === column.key
                ? ascending
                  ? "ascending"
                  : "descending"
                : "none"
            }
          >
            <button
              className="sort-button"
              type="button"
              onClick={() => onSort(column.key)}
            >
              {column.label}
              {sortColumn === column.key && (
                <span className="sort-arrow" aria-hidden="true">
                  {ascending ? "↑" : "↓"}
                </span>
              )}
            </button>
          </th>
        ))}
      </tr>
    </thead>
  );
}
