from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import UserCreate, UserOut
from core.security import hash_password, verify_password, create_access_token
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

    # Hash password
    hashed_pw = hash_password(user.password)

    # Insert user into DB
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "hashed_password": hashed_pw,
        "role": user.role,
        "is_active": True  # ✅ user starts active
    }
    await db["users"].insert_one(new_user)

    return UserOut(
        id=new_user["id"],
        username=user.username,
        role=user.role,
        is_active=True
    )


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