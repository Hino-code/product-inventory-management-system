import React, { useState } from 'react';
import { Card, Row, Col, Container, Alert, ButtonGroup, Button } from 'react-bootstrap';
import { useDashboard } from '../hooks/useDashboard';
import SalesTrend from '../components/Dashboard/Charts/SalesTrend';
import MetricCard from '../components/Dashboard/Cards/MetricCard';
import ProductStatus from '../components/Dashboard/Charts/ProductStatus';
import DashboardSkeleton from '../components/Dashboard/SkeletonLoader';
import ReportModal from '../components/ReportModal';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [period, setPeriod] = useState('week');
  const { data, error, isLoading } = useDashboard(period);
  const [showReportModal, setShowReportModal] = useState(false);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Alert variant="danger">{error.message || String(error)}</Alert>;

  return (
    <Container fluid className="px-4 py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0 fw-bold" style={{ fontSize: '1.8rem', color: '#111827' }}>Dashboard Overview</h2>
        <div className="d-flex align-items-center gap-2">
          <ButtonGroup size="sm" aria-label="Period selector">
            {['week', 'month', 'year', 'all'].map(p => (
              <Button
                key={p}
                variant={period === p ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod(p)}
                style={{ fontWeight: '500', borderRadius: '0.5rem', padding: '0.35rem 0.8rem' }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setShowReportModal(true)}
            style={{ borderRadius: '0.5rem', fontWeight: '500', padding: '0.35rem 0.8rem' }}
          >
            Download Reports
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <Row className="mb-4 g-4">
        <Col xl={3} lg={6} md={6}>
          <MetricCard title="Total Revenue" value={data.orders.total_revenue} isCurrency shadow rounded />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <MetricCard title="Total Orders" value={data.orders.total_orders} shadow rounded />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <MetricCard title="Items Sold" value={data.orders.total_items_sold} shadow rounded />
        </Col>
        <Col xl={3} lg={6} md={6}>
          <MetricCard title="Inventory Value" value={data.products.inventory_value} isCurrency shadow rounded />
        </Col>
      </Row>

      {/* Mini Donut KPI and SalesTrend */}
      <Row className="mb-4 g-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="dashboard-card h-100 shadow-sm rounded p-3 text-center" style={{ backgroundColor: '#ffffff' }}>
            <Card.Body>
              <Card.Title className="card-title fw-semibold" style={{ fontSize: '1rem', color: '#374151' }}>
                Product Status
              </Card.Title>
              <ProductStatus
                totalProducts={data.products.total_products}
                lowStock={data.products.low_stock_count}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={9} lg={12} md={12}>
          <Card className="dashboard-card h-100 shadow-sm rounded p-3" style={{ backgroundColor: '#ffffff' }}>
            <Card.Body>
              <Card.Title className="card-title fw-semibold" style={{ fontSize: '1rem', color: '#374151' }}>
                {period === 'week' ? '7-Day Sales Trend' :
                 period === 'month' ? '30-Day Sales Trend' :
                 period === 'year' ? 'Monthly Sales Trend' : 'Sales Trend'}
              </Card.Title>
              <SalesTrend data={data.sales_trend} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <ReportModal show={showReportModal} onClose={() => setShowReportModal(false)} period={period} />
    </Container>
  );
}
