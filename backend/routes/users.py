from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserOut, UserSelfUpdate, RoleUpdate
from dependencies.auth import get_current_user
from core.security import hash_password
from db import db
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["users"])


# -------------------
# Get current user profile
# -------------------
@router.get("/me", response_model=UserOut)
async def get_self(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)


# -------------------
# Update own username/password
# -------------------
@router.put("/me", response_model=UserOut)
async def update_self(user_update: UserSelfUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {}

    if user_update.username:
        update_data["username"] = user_update.username
    if user_update.password:
        update_data["hashed_password"] = hash_password(user_update.password)

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db["users"].update_one({"id": current_user["id"]}, {"$set": update_data})
    updated = await db["users"].find_one({"id": current_user["id"]})
    return UserOut(
        id=updated["id"],
        username=updated["username"],
        role=updated["role"],
        is_active=updated.get("is_active", True)
    )


# -------------------
# Owner: Change a user's role
# -------------------
@router.put("/{user_id}/role", response_model=UserOut)
async def update_user_role(user_id: str, role_update: RoleUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can change roles")

    # Prevent demoting self (optional safety)
    if str(current_user["id"]) == user_id:
        raise HTTPException(status_code=400, detail="Owners cannot change their own role")

    result = await db["users"].update_one(
        {"id": user_id},
        {"$set": {"role": role_update.role}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await db["users"].find_one({"id": user_id})
    return UserOut(
        id=updated["id"],
        username=updated["username"],
        role=updated["role"],
        is_active=updated.get("is_active", True)
    )


# -------------------
# Owner: List all users
# -------------------
@router.get("/", response_model=list[UserOut])
async def list_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can view all users")

    users = await db["users"].find().to_list(100)
    return [
        UserOut(
            id=u["id"],
            username=u["username"],
            role=u["role"],
            is_active=u.get("is_active", True)
        )
        for u in users
    ]


# -------------------
# Owner: Activate/Deactivate user
# -------------------
@router.patch("/{user_id}/activate")
async def activate_user(user_id: str, is_active: bool, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can manage activation")

    result = await db["users"].update_one({"id": user_id}, {"$set": {"is_active": is_active}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}
