from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# -------------------
# Order Item (input from client)
# -------------------
class OrderItemIn(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

# -------------------
# Order Item (stored in DB / output)
# -------------------
class OrderItemOut(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    subtotal: float

# -------------------
# Create order (input)
# -------------------
class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    items: List[OrderItemIn]

# -------------------
# Output order (DB response)
# -------------------
class OrderOut(BaseModel):
    id: str
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    items: List[OrderItemOut]
    total: float
    created_at: datetime
    created_by_id: str
    created_by_username: str
    status: str = "completed"
