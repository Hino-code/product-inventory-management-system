// src/components/ReportModal.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../api/axios";

export default function ReportModal({ show, onClose }) {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      let url = "";
      let params = {};

      if (reportType === "sales") {
        url = "/reports/sales/pdf";
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      } else if (reportType === "inventory") {
        url = "/reports/inventory/pdf";
      } else {
        return;
      }

      const res = await api.get(url, {
        params,
        responseType: "blob", // important for binary files
      });

      // Create a download link
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const fileName =
        reportType === "sales"
          ? `sales_report_${Date.now()}.pdf`
          : `inventory_report_${Date.now()}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSalesSelected = reportType === "sales";

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Download Report</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Select Report Type</Form.Label>
            <Form.Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">-- Choose --</option>
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
            </Form.Select>
          </Form.Group>

          {isSalesSelected && (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={!reportType || loading}
        >
          {loading ? "Downloading..." : "Download"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
