import type { ChangeEventHandler, RefObject } from "react";

type TableToolbarProps = {
  actionsRef: RefObject<HTMLDivElement | null>;
  search: string;
  hasSelectedUser: boolean;
  isDisabled: boolean;
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TableToolbar({
  actionsRef,
  search,
  hasSelectedUser,
  isDisabled,
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
        disabled={isDisabled}
        onChange={onSearchChange}
      />

      <div className="action-buttons" ref={actionsRef}>
        <button type="button" onClick={onAdd} disabled={isDisabled}>
          Add
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={!hasSelectedUser || isDisabled}
        >
          Edit
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={onDelete}
          disabled={!hasSelectedUser || isDisabled}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
