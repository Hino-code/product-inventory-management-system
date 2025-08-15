from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal
import uuid

class StockOperation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    type: Literal["increase", "decrease"]  # operation type
    quantity: int = Field(..., gt=0)  # must be positive
    reason: str = Field(..., min_length=1, max_length=255)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    performed_by_id: str
    performed_by_username: str
