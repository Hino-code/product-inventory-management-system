# backend/routes/dashboard.py
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_cache.decorator import cache
from db import db
from dependencies.auth import get_current_user
from datetime import datetime, timedelta
from bson.decimal128 import Decimal128
from typing import Optional, Literal
import logging

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)

def _to_float(value) -> float:
    if value is None:
        return 0.0

    try:
        if isinstance(value, Decimal128):
            decimal_val = value.to_decimal()
            return float(str(decimal_val))
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            cleaned = value.replace('$', '').replace(',', '').strip()
            return float(cleaned)
        logger.warning(f"Unexpected type for conversion: {type(value)}")
        return 0.0
    except Exception as e:
        logger.error(f"Conversion failed for value {value} ({type(value)}): {str(e)}")
        return 0.0


def _period_to_days(period: str) -> int:
    """Translate high-level period to days for the date window"""
    period = (period or "week").lower()
    if period in ("week", "7", "7d"):
        return 7
    if period in ("month", "30", "30d"):
        return 30
    if period in ("year", "365", "365d"):
        return 365
    if period in ("all", "0"):
        # very large window effectively "all"
        return 36500
    # default
    return 7


@router.get("/")
@cache(expire=300, namespace="dashboard")
async def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    period: Optional[Literal["week", "month", "year", "all"]] = Query("week"),
):
    """
    Dashboard summary endpoint.

    Query params:
    - period: one of "week" (7 days), "month" (30 days), "year" (365 days), or "all".
    """
    try:
        if current_user["role"] not in ["owner", "staff"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        days = _period_to_days(period)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Safe aggregation helper
        async def safe_aggregate(collection, pipeline, default):
            try:
                cursor = collection.aggregate(pipeline)
                result = await cursor.to_list(length=1)
                return result[0] if result else default
            except Exception as e:
                logger.error(f"Aggregation failed in {collection.name}: {str(e)}")
                logger.debug(f"Failed pipeline: {pipeline}")
                return default

        # Determine date format for trend aggregation
        date_format = "%Y-%m-%d"
        if period == "year":
            date_format = "%Y-%m"
        elif period == "all":
            date_format = "%Y"

        # Aggregation pipelines
        orders_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": None,
                "total_orders": {"$sum": 1},
                "total_revenue": {"$sum": "$total"},
                "total_items": {"$sum": {"$size": "$items"}}
            }}
        ]

        products_pipeline = [
            {"$facet": {
                "status_counts": [
                    {"$group": {"_id": "$is_active", "count": {"$sum": 1}}}
                ],
                "inventory_value": [
                    {"$group": {"_id": None, "total": {"$sum": {"$multiply": ["$price", "$stock"]}}}}
                ],
                "low_stock": [
                    {"$match": {"stock": {"$lte": 5}}},
                    {"$count": "count"}
                ]
            }}
        ]

        trend_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": date_format, "date": "$created_at"}},
                "revenue": {"$sum": "$total"},
                "orders": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]

        # Run aggregations in parallel
        results = await asyncio.gather(
            safe_aggregate(db["orders"], orders_pipeline, {"total_orders": 0, "total_revenue": Decimal128("0"), "total_items": 0}),
            safe_aggregate(db["products"], products_pipeline, {"status_counts": [], "inventory_value": [{"total": Decimal128("0")}], "low_stock": []}),
            db["orders"].aggregate(trend_pipeline).to_list(None),
            return_exceptions=True
        )

        orders_data, products_data, trend_data = results

        # Orders block
        orders_block = {
            "total_orders": orders_data.get("total_orders", 0) if not isinstance(orders_data, Exception) else 0,
            "total_revenue": _to_float(orders_data.get("total_revenue")) if not isinstance(orders_data, Exception) else 0,
            "total_items_sold": orders_data.get("total_items", 0) if not isinstance(orders_data, Exception) else 0
        }

        # Products block
        status_counts = products_data.get("status_counts", []) if not isinstance(products_data, Exception) else []
        inventory_list = products_data.get("inventory_value", [{}]) if not isinstance(products_data, Exception) else [{}]
        low_stock_list = products_data.get("low_stock", []) if not isinstance(products_data, Exception) else []

        products_block = {
            "total_products": sum(p.get("count", 0) for p in status_counts),
            "active_products": next((p.get("count", 0) for p in status_counts if p.get("_id") is True), 0),
            "inactive_products": next((p.get("count", 0) for p in status_counts if p.get("_id") is False), 0),
            "inventory_value": _to_float(inventory_list[0].get("total") if inventory_list else 0),
            "low_stock_count": low_stock_list[0].get("count", 0) if low_stock_list else 0
        }

        # Sales trend
        sales_trend = []
        if not isinstance(trend_data, Exception):
            for entry in trend_data:
                sales_trend.append({
                    "date": entry.get("_id"),
                    "revenue": _to_float(entry.get("revenue")),
                    "orders": int(entry.get("orders", 0))
                })

        response_data = {
            "period": period,
            "days": days,
            "orders": orders_block,
            "products": products_block,
            "sales_trend": sales_trend
        }

        logger.debug("Dashboard response prepared: %s", response_data)
        return response_data

    except Exception:
        logger.exception("Dashboard generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate dashboard data")
