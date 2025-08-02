from fastapi import APIRouter, HTTPException
from db import db

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
async def get_products():
    products = await db["products"].find().to_list(100)
    return products

@router.post("/")
async def add_product(product: dict):
    result = await db["products"].insert_one(product)
    if result.inserted_id:
        return {"message": "Product added", "id": str(result.inserted_id)}
    raise HTTPException(status_code=400, detail="Failed to add product")
