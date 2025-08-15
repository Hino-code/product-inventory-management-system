from fastapi import APIRouter, HTTPException, Depends, status, requests
from fastapi.security import OAuth2PasswordRequestForm
from models.user import UserCreate, UserOut
from core.security import hash_password, verify_password, create_access_token
from core.security import get_current_user
from db import db
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


# -------------------
# Signup (Owner creates users)
# -------------------
@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate):
    # Check if user already exists
    existing = await db["users"].find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Check email uniqueness (if provided)
    if user.email:
        email_exists = await db["users"].find_one({"email": user.email})
        if email_exists:
            raise HTTPException(status_code=400, detail="Email already in use")

    # Hash password
    hashed_pw = hash_password(user.password)

    # Insert user into DB
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "hashed_password": hashed_pw,
        "role": user.role,
        "is_active": True,
        "full_name": user.full_name,
        "email": user.email,
        "contact_no": user.contact_no,
        "address": user.address,
        "dob": str(user.dob) if user.dob else None,
    }
    await db["users"].insert_one(new_user)

    return UserOut(**new_user)


# -------------------
# Login (OAuth2 flow)
# -------------------
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user
    db_user = await db["users"].find_one({"username": form_data.username})
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Check if user is active
    if not db_user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")

    # Verify password
    if not verify_password(form_data.password, db_user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create JWT
    token = create_access_token({
        "sub": db_user["id"],  # <-- use id
        "username": db_user["username"],
        "role": db_user["role"]
    })

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    """Return user info for the current token."""
    # Look up full user in DB using ID from token
    user = await db["users"].find_one({"id": current_user["id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(**user)