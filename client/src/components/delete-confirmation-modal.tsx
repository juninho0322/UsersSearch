import type { User } from "../types/user";

type DeleteConfirmationModalProps = {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmationModal({
  user,
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
            aria-label="Close delete confirmation"
          >
            x
          </button>
        </div>

        <p className="delete-message">
          Are you sure you want to delete user #{user.id} - {user.userName}?
        </p>

        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            No
          </button>
          <button className="danger-button confirm-button" type="button" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

