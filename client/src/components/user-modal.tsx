import type { FormEvent, KeyboardEvent } from "react";
import type { UserInput } from "../types/user";

export type UserFormValues = Omit<UserInput, "salary" | "yearsOfService"> & {
  salary: string;
  yearsOfService: string;
};
export type UserModalMode = "add" | "edit";

export type NumberFieldKey = "salary" | "yearsOfService";

type UserModalProps = {
  mode: UserModalMode;
  values: UserFormValues;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTextFieldChange: (key: keyof UserFormValues, value: string) => void;
  onNumberFieldChange: (key: NumberFieldKey, value: string) => void;
};

function preventInvalidNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(event.key)) {
    event.preventDefault();
  }
}

export function UserModal({
  mode,
  values,
  errorMessage,
  isSubmitting,
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
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form className="user-form" onSubmit={onSubmit}>
          {errorMessage && (
            <p className="status-message error form-message">{errorMessage}</p>
          )}

          <label>
            Name
            <input
              type="text"
              value={values.userName}
              onChange={(event) =>
                onTextFieldChange("userName", event.target.value)
              }
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              required
            />
          </label>

          <label>
            Salary
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={values.salary}
              onKeyDown={preventInvalidNumberKeys}
              onChange={(event) =>
                onNumberFieldChange("salary", event.target.value)
              }
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              required
            />
          </label>

          <label>
            Years service
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={values.yearsOfService}
              onKeyDown={preventInvalidNumberKeys}
              onChange={(event) =>
                onNumberFieldChange("yearsOfService", event.target.value)
              }
              disabled={isSubmitting}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                  ? "Add user"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
