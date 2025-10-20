import React from "react";
import "./Modal.css";

export default function Modal({
  open,
  title = "",
  message = "",
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "info", // "info" | "confirm"
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && onCancel) onCancel();
  };

  return (
    <div className="app-modal-backdrop" onClick={handleBackdrop}>
      <div className="app-modal">
        {title && <div className="app-modal-title">{title}</div>}
        {message && <div className="app-modal-message">{message}</div>}
        <div className="app-modal-actions">
          {variant === "confirm" && (
            <button className="btn secondary" onClick={onCancel}>{cancelText}</button>
          )}
          <button className="btn primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
