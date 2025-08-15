# routes/users.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models.user import UserOut, UserCreate, RoleUpdate
from dependencies.auth import get_current_user
from db import db
import shutil, os
import uuid

router = APIRouter(prefix="/users", tags=["users"])
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------
# Get all users (owner only)
# ---------------------------
@router.get("", response_model=list[UserOut])
async def list_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = await db["users"].find().to_list(100)
    return [UserOut(**u) for u in users]

# ---------------------------
# Add a new user
# ---------------------------
@router.post("", response_model=UserOut)
async def add_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")

    existing = await db["users"].find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = user.dict()
    new_user["id"] = str(uuid.uuid4())
    new_user["is_active"] = True
    await db["users"].insert_one(new_user)
    return UserOut(**new_user)

# ---------------------------
# Update role of a user
# ---------------------------
@router.put("/{user_id}/role", response_model=UserOut)
async def update_role(user_id: str, role_update: RoleUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = await db["users"].find_one_and_update(
        {"id": user_id},
        {"$set": {"role": role_update.role}},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**updated)

# ---------------------------
# Activate / Deactivate user
# ---------------------------
@router.patch("/{user_id}/activate", response_model=UserOut)
async def toggle_active(user_id: str, is_active: bool, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = await db["users"].find_one_and_update(
        {"id": user_id},
        {"$set": {"is_active": is_active}},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**updated)

# ---------------------------
# Update profile picture
# ---------------------------
@router.put("/me/profile-picture", response_model=UserOut)
async def update_profile_picture(
    profile_picture: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not profile_picture:
        raise HTTPException(status_code=400, detail="No file uploaded")

    filename = f"{current_user['id']}_{profile_picture.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(profile_picture.file, f)

    await db["users"].update_one(
        {"id": current_user["id"]},
        {"$set": {"profile_picture": f"/{UPLOAD_DIR}/{filename}"}}
    )

    updated = await db["users"].find_one({"id": current_user["id"]})
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(**updated)
