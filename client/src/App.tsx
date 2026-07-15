import { useEffect, useState } from "react";

import { Container } from "./components/container.js";
import { Table } from "./components/table.js";
import type { User } from "./types/user.js";

import "./App.css";

type UsersResponse = {
  data: User[];
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("http://localhost:4000/api/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const result: UsersResponse = await response.json();

        setUsers(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

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
      <Table users={users} />
    </Container>
  );
}

export default App;