from fastapi import APIRouter, Depends, HTTPException, status
from db import db
from models.order import OrderCreate, OrderOut, OrderItemOut
from dependencies.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/orders", tags=["orders"])

# -------------------
# Create a new order
# -------------------
@router.post("/", response_model=OrderOut)
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    order_items = []
    total = 0.0
    updated_products = []  # track stock changes for rollback

    try:
        for item in order.items:
            # Fetch product
            product = await db["products"].find_one({"id": item.product_id, "is_active": True})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

            if product["stock"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {product['name']}")

            subtotal = product["price"] * item.quantity
            total += subtotal

            # Deduct stock (safe check stock >= qty again)
            result = await db["products"].update_one(
                {"id": product["id"], "stock": {"$gte": item.quantity}},
                {"$inc": {"stock": -item.quantity}}
            )
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail=f"Stock update failed for {product['name']}")

            updated_products.append((product["id"], item.quantity))

            order_items.append(OrderItemOut(
                product_id=product["id"],
                product_name=product["name"],
                quantity=item.quantity,
                price=product["price"],
                subtotal=subtotal
            ))

        new_order = {
            "id": str(uuid.uuid4()),
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "customer_email": order.customer_email,
            "customer_address": order.customer_address,
            "items": [item.dict() for item in order_items],
            "total": total,
            "created_at": datetime.utcnow(),
            "created_by_id": current_user["id"],
            "created_by_username": current_user["username"],
            "status": "completed"
        }

        await db["orders"].insert_one(new_order)
        return OrderOut(**new_order)

    except Exception as e:
        # Rollback product stock
        for product_id, qty in updated_products:
            await db["products"].update_one({"id": product_id}, {"$inc": {"stock": qty}})
        raise e


# -------------------
# Get all orders
# -------------------
@router.get("/", response_model=list[OrderOut])
async def list_orders(current_user: dict = Depends(get_current_user)):
    orders = await db["orders"].find().sort("created_at", -1).to_list(100)
    return [OrderOut(**o) for o in orders]


# -------------------
# Get single order
# -------------------
@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut(**order)


# -------------------
# Cancel order (restore stock)
# -------------------
@router.patch("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")

    # Restore stock
    for item in order["items"]:
        await db["products"].update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": item["quantity"]}}
        )

    # Update order status
    await db["orders"].update_one({"id": order_id}, {"$set": {"status": "cancelled"}})
    order["status"] = "cancelled"
    return OrderOut(**order)


# -------------------
# Mark order as pending
# -------------------
@router.patch("/{order_id}/pending", response_model=OrderOut)
async def mark_order_pending(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db["orders"].find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != "completed":
        raise HTTPException(status_code=400, detail="Only completed orders can be moved to pending")

    await db["orders"].update_one({"id": order_id}, {"$set": {"status": "pending"}})
    order["status"] = "pending"
    return OrderOut(**order)
