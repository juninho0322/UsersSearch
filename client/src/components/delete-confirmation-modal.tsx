import type { User } from "../types/user";

type DeleteConfirmationModalProps = {
  user: User;
  errorMessage: string | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmationModal({
  user,
  errorMessage,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="delete-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Delete user?</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
          >
            &times;
          </button>
        </div>

        <p className="delete-message">
          Are you sure you want to delete user #{user.id} - {user.userName}?
        </p>

        {errorMessage && <p className="status-message error">{errorMessage}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onCancel} disabled={isDeleting}>
            No
          </button>
          <button
            className="danger-button confirm-button"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}
