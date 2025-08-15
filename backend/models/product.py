# models/product.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=1000)
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    stock: int = Field(..., ge=0, description="Stock cannot be negative")
    is_active: bool = Field(default=True)
    category_id: Optional[str] = Field(None, description="UUID string of category")

    @validator("name")
    def strip_name(cls, v: str) -> str:
        return v.strip()

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool]
    category_id: Optional[str]

    @validator("name")
    def strip_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return v.strip()

class ProductOut(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

