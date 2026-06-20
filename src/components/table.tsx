import { useState } from "react";
import type { TableUsers, User } from "../data/mockUsers";
import { formatCurrency } from "../helpers/formatCurrency"


export function Table({ users }: TableUsers) {
  const [sortedUsers, setSortedUsers] = useState<User[]>(users);
  const [ascending, setAscending] = useState(false);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof User | "">("");

  function sortBy(key: keyof User) {
    const sorted = [...sortedUsers].sort((a, b) => {
      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return ascending ? a[key] - b[key] : b[key] - a[key];
      }
      return ascending
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });

    setSortedUsers(sorted);
    setSortColumn(key);
    setAscending(!ascending);
  }

  const filteredUsers = sortedUsers.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <>
      <input
        type="text"
        placeholder="Search table..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th onClick={() => sortBy("id")}>
              Id {sortColumn === "id" && (ascending ? "▼" : "▲")}
            </th>

            <th onClick={() => sortBy("userName")}>
              Name {sortColumn === "userName" && (ascending ? "▼" : "▲")}
            </th>

            <th onClick={() => sortBy("position")}>
              Position {sortColumn === "position" && (ascending ? "▼" : "▲")}
            </th>

            <th onClick={() => sortBy("salary")}>
              Salary {sortColumn === "salary" && (ascending ? "▼" : "▲")}
            </th>

            <th onClick={() => sortBy("country")}>
              Country {sortColumn === "country" && (ascending ? "▼" : "▲")}
            </th>

            <th onClick={() => sortBy("department")}>
              Department {sortColumn === "department" && (ascending ? "▼" : "▲")}
            </th>
            <th onClick={() => sortBy("yearsOfService")}>
              Years Service {sortColumn === "yearsOfService" && (ascending ? "▼" : "▲")}
            </th>

          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.userName}</td>
              <td>{user.position}</td>
              <td>{formatCurrency(user.salary)}</td>
              <td>{user.country}</td>
              <td>{user.department}</td>
              <td>{user.yearsOfService}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
