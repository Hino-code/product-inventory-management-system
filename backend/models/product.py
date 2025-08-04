from pydantic import BaseModel, Field
from typing import Optional
import uuid

# ---------
# Product Schemas
# ---------
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
