import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { TableToolbar } from "./table-toolbar";
import { UserModal } from "./user-modal";
import type { UserFormValues, UserModalMode } from "./user-modal";
import { UserTableBody } from "./user-table-body";
import { UserTableHeader } from "./user-table-header";
import type { User } from "../types/user";

type TableProps = {
  users: User[];
};

const emptyUserForm: UserFormValues = {
  userName: "",
  country: "",
  position: "",
  salary: 0,
  department: "",
  yearsOfService: 0,
};


export function Table({ users }: TableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [sortedUsers, setSortedUsers] = useState<User[]>(users);
  const [ascending, setAscending] = useState(false);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof User | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<UserModalMode>("add");
  const [formValues, setFormValues] = useState<UserFormValues>(emptyUserForm);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedUser = sortedUsers.find((user) => user.id === selectedUserId);

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
    setIsDeleteModalOpen(false);
  }

  function selectUser(userId: number) {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(false);
  }

  function openAddModal() {
    setModalMode("add");
    setFormValues(emptyUserForm);
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
      salary: selectedUser.salary,
      department: selectedUser.department,
      yearsOfService: selectedUser.yearsOfService,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function deleteSelectedUser() {
    if (!selectedUserId || !selectedUser) {
      return;
    }

    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
  }

  function confirmDeleteSelectedUser() {
    if (!selectedUserId) {
      return;
    }

    setSortedUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== selectedUserId),
    );
    clearSelectedUser();
  }

  function updateTextField(key: keyof UserFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateNumberField(key: "salary" | "yearsOfService", value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: Number(value),
    }));
  }

  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (modalMode === "add") {
      const nextId = Math.max(0, ...sortedUsers.map((user) => user.id)) + 1;
      const newUser: User = {
        id: nextId,
        ...formValues,
      };

      setSortedUsers((currentUsers) => [...currentUsers, newUser]);
      setSelectedUserId(newUser.id);
    } else if (selectedUserId) {
      setSortedUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUserId ? { ...user, ...formValues } : user,
        ),
      );
    }

    setIsDeleteModalOpen(false);
    closeModal();
  }

  const filteredUsers = sortedUsers.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <>
      <TableToolbar
        actionsRef={actionsRef}
        search={search}
        hasSelectedUser={Boolean(selectedUser)}
        onSearchChange={(event) => setSearch(event.target.value)}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={deleteSelectedUser}
      />

      <table ref={tableRef}>
        <UserTableHeader
          sortColumn={sortColumn}
          ascending={ascending}
          onSort={sortBy}
        />
        <UserTableBody
          users={filteredUsers}
          selectedUserId={selectedUserId}
          onSelectUser={selectUser}
        />
      </table>

      {isModalOpen && (
        <UserModal
          mode={modalMode}
          values={formValues}
          onClose={closeModal}
          onSubmit={saveUser}
          onTextFieldChange={updateTextField}
          onNumberFieldChange={updateNumberField}
        />
      )}

      {isDeleteModalOpen && selectedUser && (
        <DeleteConfirmationModal
          user={selectedUser}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteSelectedUser}
        />
      )}
    </>
  );
}
