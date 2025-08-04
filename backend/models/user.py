from pydantic import BaseModel, Field
from typing import Optional

# -------------------
# Shared fields
# -------------------
class UserBase(BaseModel):
    username: str
    role: str = Field(..., pattern="^(owner|employee)$")
    is_active: bool = True   # always present (not Optional, defaults to True)

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
# Self-update (username, password only)
# -------------------
class UserSelfUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None

# -------------------
# Role update (owner can change employee roles)
# -------------------
class RoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(owner|employee)$")

# -------------------
# General update (owner can also toggle is_active)
# -------------------
class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(owner|employee)$")
    is_active: Optional[bool] = None
