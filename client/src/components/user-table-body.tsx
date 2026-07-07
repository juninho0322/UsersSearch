import type { User } from "../types/user";
import { UserTableRow } from "./user-table-row";

type UserTableBodyProps = {
  users: User[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
};

export function UserTableBody({
  users,
  selectedUserId,
  onSelectUser,
}: UserTableBodyProps) {
  return (
    <tbody>
      {users.map((user) => (
        <UserTableRow
          key={user.id}
          user={user}
          isSelected={selectedUserId === user.id}
          onSelect={onSelectUser}
        />
      ))}
    </tbody>
  );
}

