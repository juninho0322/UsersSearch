import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { TableToolbar } from "./table-toolbar";
import { UserModal } from "./user-modal";
import type {
  NumberFieldKey,
  UserFormValues,
  UserModalMode,
} from "./user-modal";
import { UserTableBody } from "./user-table-body";
import { UserTableHeader } from "./user-table-header";
import type { PaginationMeta, User, UserInput, UserSortOrder } from "../types/user";

type TableProps = {
  users: User[];
  sortColumn: keyof User;
  sortOrder: UserSortOrder;
  search: string;
  pagination: PaginationMeta | null;
  isMutating: boolean;
  onSort: (column: keyof User) => void;
  onSearchChange: (value: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onAddUser: (values: UserInput) => Promise<void>;
  onEditUser: (userId: number, values: UserInput) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
};

const emptyUserForm: UserFormValues = {
  userName: "",
  country: "",
  position: "",
  salary: "",
  department: "",
  yearsOfService: "",
};

function normaliseNumberField(key: NumberFieldKey, value: string): string {
  if (key === "yearsOfService") {
    return value.replace(/\D/g, "");
  }

  const numericValue = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = numericValue.split(".");
  const decimal = decimalParts.join("").slice(0, 2);

  return decimalParts.length > 0 ? `${whole}.${decimal}` : whole;
}

function toUserInput(values: UserFormValues): UserInput {
  const salary = Number(values.salary);
  const yearsOfService = Number(values.yearsOfService);

  if (!values.salary.trim()) {
    throw new Error("Salary is required.");
  }

  if (!Number.isFinite(salary) || salary < 0) {
    throw new Error("Salary must be a valid positive number.");
  }

  if (!values.yearsOfService.trim()) {
    throw new Error("Years of service is required.");
  }

  if (
    !Number.isInteger(yearsOfService) ||
    yearsOfService < 0 ||
    yearsOfService > 80
  ) {
    throw new Error("Years of service must be a whole number from 0 to 80.");
  }

  return {
    userName: values.userName.trim(),
    country: values.country.trim(),
    position: values.position.trim(),
    salary,
    department: values.department.trim(),
    yearsOfService,
  };
}

export function Table({
  users,
  sortColumn,
  sortOrder,
  search,
  pagination,
  isMutating,
  onSort,
  onSearchChange,
  onPreviousPage,
  onNextPage,
  onAddUser,
  onEditUser,
  onDeleteUser,
}: TableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<UserModalMode>("add");
  const [formValues, setFormValues] = useState<UserFormValues>(emptyUserForm);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const visibleUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filteredUsers = searchText
      ? users.filter((user) =>
          Object.values(user).some((value) =>
            String(value).toLowerCase().includes(searchText),
          ),
        )
      : users;

    return [...filteredUsers].sort((firstUser, secondUser) => {
      const firstValue = firstUser[sortColumn];
      const secondValue = secondUser[sortColumn];

      let comparison = 0;

      if (typeof firstValue === "string" && typeof secondValue === "string") {
        comparison = firstValue.localeCompare(secondValue);
      } else if (
        typeof firstValue === "number" &&
        typeof secondValue === "number"
      ) {
        comparison = firstValue - secondValue;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [search, sortColumn, sortOrder, users]);

  const selectedUser = visibleUsers.find((user) => user.id === selectedUserId);
  const hasPreviousPage = Boolean(pagination && pagination.page > 1);
  const hasNextPage = Boolean(
    pagination && pagination.page < pagination.totalPages,
  );

  function clearSelectedUser() {
    setSelectedUserId(null);
    setIsDeleteModalOpen(false);
  }

  useEffect(() => {
    function clearSelectionOnOutsideClick(event: MouseEvent) {
      if (isModalOpen || isDeleteModalOpen || !(event.target instanceof Node)) {
        return;
      }

      if (tableRef.current?.contains(event.target)) {
        return;
      }

      if (actionsRef.current?.contains(event.target)) {
        return;
      }

      setSelectedUserId(null);
      setIsDeleteModalOpen(false);
    }

    document.addEventListener("mousedown", clearSelectionOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", clearSelectionOnOutsideClick);
    };
  }, [isModalOpen, isDeleteModalOpen]);

  function selectUser(userId: number) {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(false);
  }

  function openAddModal() {
    setModalMode("add");
    setFormValues(emptyUserForm);
    setFormError(null);
    clearSelectedUser();
    setIsModalOpen(true);
  }

  function openEditModal() {
    if (!selectedUser) {
      return;
    }

    setModalMode("edit");
    setFormValues({
      userName: selectedUser.userName,
      country: selectedUser.country,
      position: selectedUser.position,
      salary: String(selectedUser.salary),
      department: selectedUser.department,
      yearsOfService: String(selectedUser.yearsOfService),
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setFormError(null);
    setIsModalOpen(false);
  }

  function deleteSelectedUser() {
    if (!selectedUserId || !selectedUser) {
      return;
    }

    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setFormError(null);
    setIsDeleteModalOpen(false);
  }

  async function confirmDeleteSelectedUser() {
    if (selectedUserId === null) {
      return;
    }

    try {
      setFormError(null);
      await onDeleteUser(selectedUserId);
      clearSelectedUser();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not delete user.",
      );
    }
  }

  function updateTextField(key: keyof UserFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateNumberField(key: NumberFieldKey, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: normaliseNumberField(key, value),
    }));
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setFormError(null);
      const input = toUserInput(formValues);

      if (modalMode === "add") {
        await onAddUser(input);
      } else if (selectedUserId !== null) {
        await onEditUser(selectedUserId, input);
      }

      setIsDeleteModalOpen(false);
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save user.",
      );
    }
  }

  return (
    <>
      <TableToolbar
        actionsRef={actionsRef}
        search={search}
        hasSelectedUser={Boolean(selectedUser)}
        isDisabled={isMutating}
        onSearchChange={(event) => onSearchChange(event.target.value)}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={deleteSelectedUser}
      />

      <div className="table-scroll" role="region" aria-label="Users table">
        <table ref={tableRef}>
          <UserTableHeader
            sortColumn={sortColumn}
            ascending={sortOrder === "asc"}
            onSort={onSort}
          />
          <UserTableBody
            users={visibleUsers}
            selectedUserId={selectedUserId}
            onSelectUser={selectUser}
          />
        </table>
      </div>

      {pagination && (
        <div className="pagination-bar">
          <p>
            Page {pagination.page} of {Math.max(1, pagination.totalPages)} /{" "}
            {pagination.total} users · {visibleUsers.length} shown
          </p>
          <div className="pagination-actions">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={!hasPreviousPage || isMutating}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={!hasNextPage || isMutating}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UserModal
          mode={modalMode}
          values={formValues}
          errorMessage={formError}
          isSubmitting={isMutating}
          onClose={closeModal}
          onSubmit={saveUser}
          onTextFieldChange={updateTextField}
          onNumberFieldChange={updateNumberField}
        />
      )}

      {isDeleteModalOpen && selectedUser && (
        <DeleteConfirmationModal
          user={selectedUser}
          errorMessage={formError}
          isDeleting={isMutating}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteSelectedUser}
        />
      )}
    </>
  );
}
