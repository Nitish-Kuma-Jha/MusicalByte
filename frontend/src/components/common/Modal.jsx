import React from "react";
import "../../css/common/Modal.css";

const Modal = ({ onClose, children }) => {
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;