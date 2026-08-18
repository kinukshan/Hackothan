import React from 'react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-overlay">
      <div className="modal small">
        <div className="modal-header"><h3>{title}</h3></div>
        <div className="modal-body">
          <p>{message}</p>
          <div className="form-actions">
            <button className="btn" onClick={onConfirm}>Confirm</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
