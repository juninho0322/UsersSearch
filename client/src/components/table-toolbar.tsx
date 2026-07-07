import type { ChangeEventHandler, RefObject } from "react";

type TableToolbarProps = {
  actionsRef: RefObject<HTMLDivElement | null>;
  search: string;
  hasSelectedUser: boolean;
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TableToolbar({
  actionsRef,
  search,
  hasSelectedUser,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
}: TableToolbarProps) {
  return (
    <div className="table-toolbar">
      <input
        className="search-input"
        type="text"
        placeholder="Search table..."
        value={search}
        onChange={onSearchChange}
      />

      <div className="action-buttons" ref={actionsRef}>
        <button type="button" onClick={onAdd}>
          Add
        </button>
        <button type="button" onClick={onEdit} disabled={!hasSelectedUser}>
          Edit
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={onDelete}
          disabled={!hasSelectedUser}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
