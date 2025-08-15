import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from io import BytesIO
import logging
from bson.decimal128 import Decimal128
from bson.objectid import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PDFGenerator:
    """
    A utility class for generating professional PDF reports
    with Philippine Peso formatting and safe data processing.
    """

    def __init__(self):
        # Base dir (project root)
        self.base_dir = Path(__file__).parent.parent

        # Folders
        self.template_dir = self.base_dir / "templates"
        self.static_dir = self.base_dir / "static"
        self.template_static_dir = self.template_dir / "reports"

        # Setup Jinja environment with peso filter
        self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
        self.env.filters["php"] = self._format_php_currency

    # -------------------------------
    # SALES REPORT
    # -------------------------------
    def generate_sales_report(
        self,
        orders: List[Dict[str, Any]],
        company_name: str = "My Company Inc.",
        logo_url: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> bytes:
        """Generate a professional sales report PDF"""
        try:
            processed_orders = self._process_orders(orders)
            total_sales = sum(o["total_raw"] for o in processed_orders)

            template_data = {
                "company_name": company_name,
                "logo_url": self._get_logo_url(logo_url),
                "report_period": self._format_report_period(start_date, end_date),
                "generated_on": datetime.now().strftime("%B %d, %Y at %H:%M"),
                "orders": processed_orders,
                "total_sales": self._format_php_currency(total_sales),
                "year": datetime.now().year,
            }

            html_content = self._render_template("reports/sales_report.html", template_data)
            return self._generate_pdf(html_content)

        except Exception as e:
            logger.error(f"Failed to generate sales report PDF: {str(e)}")
            raise

    # -------------------------------
    # INVENTORY REPORT
    # -------------------------------
    def generate_inventory_report(
        self,
        products: List[Dict[str, Any]],
        company_name: str = "My Company Inc.",
        logo_url: Optional[str] = None,
    ) -> bytes:
        """Generate an inventory report PDF showing stock levels."""
        try:
            processed = self._process_products(products)
            total_value = sum(p["price_raw"] * p["stock"] for p in processed)

            template_data = {
                "company_name": company_name,
                "logo_url": self._get_logo_url(logo_url),
                "generated_on": datetime.now().strftime("%B %d, %Y at %H:%M"),
                "products": processed,
                "inventory_value": self._format_php_currency(total_value),
                "year": datetime.now().year,
            }

            html_content = self._render_template("reports/inventory_report.html", template_data)
            return self._generate_pdf(html_content)

        except Exception as e:
            logger.error(f"Failed to generate inventory PDF: {str(e)}")
            raise

    # -------------------------------
    # HELPERS
    # -------------------------------
    def _get_logo_url(self, logo_filename: Optional[str]) -> Optional[str]:
        """Get absolute file URL for logo (search in static/ then templates/reports/)"""
        if not logo_filename:
            return None

        # Primary path: static/
        logo_path = self.static_dir / logo_filename
        if logo_path.exists():
            return f"file://{logo_path.resolve()}"

        # Fallback: templates/reports/
        fallback_path = self.template_static_dir / logo_filename
        if fallback_path.exists():
            return f"file://{fallback_path.resolve()}"

        logger.warning(f"Logo not found: {logo_filename}")
        return None

    def _process_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize product data for reporting"""
        processed = []
        for p in products:
            try:
                price = self._to_float(p.get("price", 0))
                stock = int(p.get("stock", 0))
                processed.append({
                    "name": str(p.get("name", "N/A")),
                    "description": str(p.get("description", "N/A")),
                    "price": self._format_php_currency(price),
                    "price_raw": price,
                    "stock": stock,
                    "is_active": bool(p.get("is_active", True)),
                    "low_stock": stock <= 5,
                })
            except Exception as e:
                logger.warning(f"Skipping malformed product: {str(e)}")
        return processed

    def _process_orders(self, orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize orders for reporting"""
        processed = []
        for o in orders:
            try:
                total = self._to_float(o.get("total", 0))
                created_at = o.get("created_at")
                processed.append({
                    "customer_name": str(o.get("customer_name", "N/A")),
                    "date": self._format_date(created_at),
                    "items_count": self._get_items_count(o),
                    "status": str(o.get("status", "completed")),
                    "total": self._format_php_currency(total),
                    "total_raw": total,
                })
            except Exception as e:
                logger.warning(f"Skipping malformed order: {str(e)}")
        return processed

    def _render_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """Render HTML template with provided data"""
        template = self.env.get_template(template_name)
        return template.render(**data)

    def _generate_pdf(self, html_content: str) -> bytes:
        """Generate PDF from HTML content"""
        pdf_file = BytesIO()
        HTML(string=html_content).write_pdf(pdf_file)
        return pdf_file.getvalue()

    # -------------------------------
    # Helper methods
    # -------------------------------
    @staticmethod
    def _format_php_currency(amount) -> str:
        try:
            return "₱{:,.2f}".format(float(amount))
        except Exception:
            return "₱0.00"

    @staticmethod
    def _to_float(value) -> float:
        """Convert Decimal128, ObjectId, or str to float safely"""
        if isinstance(value, Decimal128):
            return float(value.to_decimal())
        if isinstance(value, ObjectId):
            return 0.0
        try:
            return float(value)
        except Exception:
            return 0.0

    @staticmethod
    def _get_items_count(order: Dict[str, Any]) -> int:
        items = order.get("items")
        try:
            return len(items) if items else 0
        except Exception:
            return 0

    @staticmethod
    def _format_date(date) -> str:
        if isinstance(date, datetime):
            return date.strftime("%b %d, %Y")
        return str(date) if date else "N/A"

    @staticmethod
    def _format_report_period(start: Optional[str], end: Optional[str]) -> str:
        if not start or not end:
            return "All Time"
        try:
            s = datetime.strptime(str(start), "%Y-%m-%d")
            e = datetime.strptime(str(end), "%Y-%m-%d")
            return f"{s.strftime('%b %d, %Y')} - {e.strftime('%b %d, %Y')}"
        except Exception:
            return "All Time"


# -------------------------------
# Convenience wrappers
# -------------------------------
def generate_sales_report_pdf(*args, **kwargs) -> bytes:
    return PDFGenerator().generate_sales_report(*args, **kwargs)

def generate_inventory_report_pdf(*args, **kwargs) -> bytes:
    return PDFGenerator().generate_inventory_report(*args, **kwargs)
