
import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { formatPHP, formatCompactNumber, getFullValue } from '../../../utils/formatters';
import '../../../styles/dashboard.css';

export default function MetricCard({
  title,
  value,
  variant = 'default',
  isCurrency = false
}) {
  const displayValue = isCurrency ? formatPHP(value) : formatCompactNumber(value);
  const isCompact = Number(value) >= 10000;
  const valueColorClass = `text-${variant === 'default' ? 'dark' : variant}`;

  return (
    <Card className="dashboard-card h-100">
      <Card.Body>
        <div className="card-title">{title}</div>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>{getFullValue(value, isCurrency)}</Tooltip>}
        >
          <div className={`card-value ${valueColorClass}`}>
            {displayValue}
            {isCompact && <sup className="compact-indicator"></sup>}
          </div>
        </OverlayTrigger>
      </Card.Body>
    </Card>
  );
}
