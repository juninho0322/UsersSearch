import type { FormEvent } from "react";
import type { User } from "../types/user";

export type UserFormValues = Omit<User, "id">;
export type UserModalMode = "add" | "edit";

type UserModalProps = {
  mode: UserModalMode;
  values: UserFormValues;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTextFieldChange: (key: keyof UserFormValues, value: string) => void;
  onNumberFieldChange: (
    key: "salary" | "yearsOfService",
    value: string,
  ) => void;
};

export function UserModal({
  mode,
  values,
  onClose,
  onSubmit,
  onTextFieldChange,
  onNumberFieldChange,
}: UserModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="user-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{mode === "add" ? "Add new user" : "Edit user"}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <form className="user-form" onSubmit={onSubmit}>
          <label>
            Name
            <input
              type="text"
              value={values.userName}
              onChange={(event) =>
                onTextFieldChange("userName", event.target.value)
              }
              required
            />
          </label>

          <label>
            Position
            <input
              type="text"
              value={values.position}
              onChange={(event) =>
                onTextFieldChange("position", event.target.value)
              }
              required
            />
          </label>

          <label>
            Salary
            <input
              type="number"
              min="0"
              value={values.salary}
              onChange={(event) =>
                onNumberFieldChange("salary", event.target.value)
              }
              required
            />
          </label>

          <label>
            Country
            <input
              type="text"
              value={values.country}
              onChange={(event) =>
                onTextFieldChange("country", event.target.value)
              }
              required
            />
          </label>

          <label>
            Department
            <input
              type="text"
              value={values.department}
              onChange={(event) =>
                onTextFieldChange("department", event.target.value)
              }
              required
            />
          </label>

          <label>
            Years service
            <input
              type="number"
              min="0"
              value={values.yearsOfService}
              onChange={(event) =>
                onNumberFieldChange("yearsOfService", event.target.value)
              }
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" type="submit">
              {mode === "add" ? "Add user" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
