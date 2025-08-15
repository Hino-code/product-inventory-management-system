import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <Card className="mb-4">
        <Card.Body>
          <Placeholder as={Card.Title} animation="glow">
            <Placeholder xs={6} />
          </Placeholder>
          <Placeholder animation="glow">
            <Placeholder xs={12} />
          </Placeholder>
        </Card.Body>
      </Card>
      
      <div className="row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-md-3 mb-4">
            <Card>
              <Card.Body>
                <Placeholder as={Card.Title} animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                  <Placeholder xs={8} />
                </Placeholder>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}