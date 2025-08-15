import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ModalAlert({ show, onClose, title, message, variant = "success" }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className={`bg-${variant} text-white`}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={variant} onClick={onClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
