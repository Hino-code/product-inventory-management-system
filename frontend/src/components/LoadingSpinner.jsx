import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`d-flex justify-content-center align-items-center ${fullPage ? 'vh-100' : ''}`}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
}