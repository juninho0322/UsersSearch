import type { User } from "../types/user";
import { formatCurrency } from "../helpers/formatCurrency";

type UserTableRowProps = {
  user: User;
  isSelected: boolean;
  onSelect: (userId: number) => void;
};

export function UserTableRow({
  user,
  isSelected,
  onSelect,
}: UserTableRowProps) {
  return (
    <tr
      className={isSelected ? "selected-row" : ""}
      onClick={() => onSelect(user.id)}
      aria-selected={isSelected}
    >
      <td>{user.id}</td>
      <td>{user.userName}</td>
      <td>{user.position}</td>
      <td>{formatCurrency(user.salary)}</td>
      <td>{user.country}</td>
      <td>{user.department}</td>
      <td>{user.yearsOfService}</td>
    </tr>
  );
}

