from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# -------------------
# Shared fields
# -------------------
class UserBase(BaseModel):
    username: str
    role: str = Field(..., pattern="^(owner|employee)$")
    is_active: bool = True

    full_name: Optional[str] = None
    email: Optional[str] = None  # <-- changed from EmailStr
    contact_no: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[date] = None


# -------------------
# Create user
# -------------------
class UserCreate(UserBase):
    password: str


# -------------------
# Public output
# -------------------
class UserOut(UserBase):
    id: str


# -------------------
# Self-update
# -------------------
class UserSelfUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    contact_no: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[date] = None


# -------------------
# Role update
# -------------------
class RoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(owner|employee)$")


# -------------------
# General update
# -------------------
class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(owner|employee)$")
    is_active: Optional[bool] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    contact_no: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[date] = None
