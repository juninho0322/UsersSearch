import { useCallback, useEffect, useState } from "react";
import { Container } from "./components/container.js";
import { Table } from "./components/table.js";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "./services/users-api.js";
import type {
  PaginationMeta,
  User,
  UserInput,
  UserSortOrder,
} from "./types/user.js";

import "./App.css";

const PAGE_SIZE = 10;

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof User>("id");
  const [sortOrder, setSortOrder] = useState<UserSortOrder>("asc");

  function handleSort(column: keyof User) {
    if (sortColumn === column) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  const refreshUsers = useCallback(
    async (nextPage = page) => {
      const result = await listUsers({
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setUsers(result.data);
      setPagination(result.meta);
    },
    [page],
  );

  async function runMutation(action: () => Promise<void>) {
    try {
      setIsMutating(true);
      await action();
    } finally {
      setIsMutating(false);
    }
  }

  async function handleAddUser(values: UserInput) {
    await runMutation(async () => {
      await createUser(values);
      setPage(1);
      await refreshUsers(1);
    });
  }

  async function handleEditUser(userId: number, values: UserInput) {
    await runMutation(async () => {
      await updateUser(userId, values);
      await refreshUsers();
    });
  }

  async function handleDeleteUser(userId: number) {
    await runMutation(async () => {
      await deleteUser(userId);

      const shouldGoBackOnePage = users.length === 1 && page > 1;
      const nextPage = shouldGoBackOnePage ? page - 1 : page;

      if (shouldGoBackOnePage) {
        setPage(nextPage);
      }

      await refreshUsers(nextPage);
    });
  }

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await refreshUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchUsers]);

  if (isLoading) {
    return (
      <Container>
        <p>Loading users...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container>
      <Table
        users={users}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        search={search}
        pagination={pagination}
        isMutating={isMutating}
        onSort={handleSort}
        onSearchChange={handleSearchChange}
        onPreviousPage={() =>
          setPage((currentPage) => Math.max(1, currentPage - 1))
        }
        onNextPage={() => setPage((currentPage) => currentPage + 1)}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
    </Container>
  );
}

export default App;
