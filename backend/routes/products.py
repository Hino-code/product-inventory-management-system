from fastapi import APIRouter, Depends, HTTPException, status
from models.product import ProductCreate, ProductOut
from db import db
from dependencies.auth import get_current_user
from typing import List

router = APIRouter(prefix="/products", tags=["products"])

# -------------------
# Create product (Owner only)
# -------------------
@router.post("/", response_model=ProductOut)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can add products")

    new_product = ProductOut(**product.dict())  # auto-generates UUID
    await db["products"].insert_one(new_product.dict())

    return new_product


# -------------------
# Get single product
# -------------------
@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    product = await db["products"].find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut(**product)


# -------------------
# Update product (Owner only)
# -------------------
@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can update products")

    update_data = product.dict()
    result = await db["products"].update_one({"id": product_id}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await db["products"].find_one({"id": product_id})
    return ProductOut(**updated)


# -------------------
# Delete product (Owner only)
# -------------------
@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can delete products")

    result = await db["products"].delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}
