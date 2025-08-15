from fastapi import APIRouter, Depends, HTTPException, Response, Query
from db import db
from dependencies.auth import get_current_user
from utils.pdf_utils import generate_sales_report_pdf, generate_inventory_report_pdf
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/sales/pdf")
async def get_sales_report_pdf(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can download sales reports")

    query = {}
    if start_date and end_date:
        query["created_at"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["created_at"] = {"$gte": start_date}
    elif end_date:
        query["created_at"] = {"$lte": end_date}

    # fetch only required fields
    projection = {"customer_name": 1, "created_at": 1, "items": 1, "status": 1, "total": 1}
    orders = await db["orders"].find(query, projection).sort("created_at", -1).to_list(500)

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for given period")

    pdf_content = generate_sales_report_pdf(
        orders,
        company_name="INC Product Inventory Management System",
        logo_url="logo.png",
        start_date=start_date.strftime("%Y-%m-%d") if start_date else None,
        end_date=end_date.strftime("%Y-%m-%d") if end_date else None,
    )

    filename = f"sales_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/inventory/pdf")
async def get_inventory_report_pdf(
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can download inventory reports")

    projection = {"name": 1, "description": 1, "price": 1, "stock": 1, "is_active": 1}
    products = await db["products"].find({}, projection).sort("name", 1).to_list(1000)

    if not products:
        raise HTTPException(status_code=404, detail="No products found")

    pdf_content = generate_inventory_report_pdf(
        products,
        company_name="INC Product Inventory Management System",
        logo_url="logo.png"
    )

    filename = f"inventory_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
