import { Container } from "./components/container.js";
import { Table } from "./components/table.js";
import { mockUsers } from "./data/mockUsers.ts";

import "./App.css";

function App() {
  return (
    <Container>
      <Table users={mockUsers} />
    </Container>
  );
}

export default App;
