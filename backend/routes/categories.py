# routes/categories.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
import re
from db import db
from dependencies.auth import get_current_user
from models.category import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can add categories")

    existing = await db["categories"].find_one({"name": {"$regex": f"^{re.escape(category.name)}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")

    new_category = CategoryOut(**category.dict())
    await db["categories"].insert_one(new_category.dict())
    return new_category

@router.get("/", response_model=List[CategoryOut])
async def list_categories():
    categories = await db["categories"].find().to_list(length=None)
    return [CategoryOut(**c) for c in categories]

@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(category_id: str):
    category = await db["categories"].find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryOut(**category)

@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(category_id: str, category: CategoryUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can update categories")

    update_data = category.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    update_data["updated_at"] = datetime.utcnow()
    result = await db["categories"].update_one({"id": category_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    updated_category = await db["categories"].find_one({"id": category_id})
    return CategoryOut(**updated_category)

@router.delete("/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can delete categories")

    result = await db["categories"].delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return {"message": "Category deleted successfully"}



