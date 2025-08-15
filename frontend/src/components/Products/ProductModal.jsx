import React from "react";
import { Modal } from "react-bootstrap";
import ProductForm from "./ProductForm";

export default function ProductModal({
  show,
  onHide,
  onSave,
  categories,
  reloadCategories,
  initialData
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Product" : "Add Product"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProductForm
          onSave={(data) => {
            onSave(data);
            onHide();
          }}
          categories={categories}
          reloadCategories={reloadCategories}
          initialData={initialData}
        />
      </Modal.Body>
    </Modal>
  );
}
