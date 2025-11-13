import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Generic Bootstrap modal wrapper for Create/Update forms.
 * Props:
 * - show: boolean to control visibility
 * - title: modal title text
 * - onClose: function to close modal
 * - onSave: function to handle save button
 * - children: form fields to render inside the modal body
 */
export default function ModalForm({ show, title, onClose, onSave, children }) {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}