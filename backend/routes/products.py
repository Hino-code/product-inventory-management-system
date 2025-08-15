# routes/products.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import re
import uuid

from db import db
from dependencies.auth import get_current_user

from models.product import ProductCreate, ProductUpdate, ProductOut
from models.category import CategoryOut

router = APIRouter(prefix="/products", tags=["products"])


# -------------------
# Helper: Require Owner
# -------------------
def require_owner(current_user: dict):
    if current_user.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can perform this action")


# -------------------
# Helper: Validate Category
# -------------------
async def get_category_or_404(category_id: str) -> CategoryOut:
    category = await db["categories"].find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
    return CategoryOut(**category)


# -------------------
# Create product
# -------------------
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    require_owner(current_user)

    # Validate category existence
    if product.category_id:
        await get_category_or_404(product.category_id)

    # Duplicate name check within same category (case-insensitive)
    ci_name_regex = {"$regex": f"^{re.escape(product.name)}$", "$options": "i"}
    query = {"name": ci_name_regex}
    if product.category_id:
        query["category_id"] = product.category_id

    if await db["products"].find_one(query):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product with this name already exists in the category")

    product_data = product.dict()
    product_data.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.utcnow(),
        "updated_at": None
    })

    await db["products"].insert_one(product_data)
    return ProductOut(**product_data)


# -------------------
# List products
# -------------------
@router.get("/", response_model=List[ProductOut])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=200),
    active_only: bool = Query(True),
    category_id: Optional[str] = Query(None),
    category_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    if active_only:
        query["is_active"] = True
    if category_id:
        query["category_id"] = category_id
    if category_name:
        category = await db["categories"].find_one({"name": {"$regex": re.escape(category_name), "$options": "i"}})
        if category:
            query["category_id"] = category["id"]
        else:
            return []  # No category match
    if search:
        query["name"] = {"$regex": re.escape(search), "$options": "i"}

    cursor = db["products"].find(query).skip(skip).limit(limit)
    results = await cursor.to_list(length=limit)
    return [ProductOut(**r) for r in results]


# -------------------
# Get single product
# -------------------
@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    product = await db["products"].find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductOut(**product)


# -------------------
# Update product
# -------------------
@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product: ProductUpdate, current_user: dict = Depends(get_current_user)):
    require_owner(current_user)

    update_data = product.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update fields provided")

    # Validate new category
    if "category_id" in update_data and update_data["category_id"]:
        await get_category_or_404(update_data["category_id"])

    # Duplicate check if name changes
    if "name" in update_data:
        ci_name_regex = {"$regex": f"^{re.escape(update_data['name'])}$", "$options": "i"}
        duplicate_query = {"name": ci_name_regex, "id": {"$ne": product_id}}

        # Use updated category_id if provided, else existing
        if "category_id" in update_data and update_data["category_id"]:
            duplicate_query["category_id"] = update_data["category_id"]
        else:
            existing_product = await db["products"].find_one({"id": product_id})
            if existing_product and existing_product.get("category_id"):
                duplicate_query["category_id"] = existing_product["category_id"]

        if await db["products"].find_one(duplicate_query):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Another product with this name exists in the category")

    update_data["updated_at"] = datetime.utcnow()

    result = await db["products"].update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updated = await db["products"].find_one({"id": product_id})
    return ProductOut(**updated)


# -------------------
# Activate product
# -------------------
@router.patch("/{product_id}/activate", response_model=ProductOut)
async def activate_product(product_id: str, current_user: dict = Depends(get_current_user)):
    require_owner(current_user)

    result = await db["products"].update_one(
        {"id": product_id},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updated = await db["products"].find_one({"id": product_id})
    return ProductOut(**updated)


# -------------------
# Deactivate product
# -------------------
@router.patch("/{product_id}/deactivate", response_model=ProductOut)
async def deactivate_product(product_id: str, current_user: dict = Depends(get_current_user)):
    require_owner(current_user)

    result = await db["products"].update_one(
        {"id": product_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    updated = await db["products"].find_one({"id": product_id})
    return ProductOut(**updated)


# -------------------
# Delete product
# -------------------
@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    require_owner(current_user)

    result = await db["products"].delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return {"message": "Product deleted successfully"}

