from dotenv import load_dotenv
import os

# Load .env file from project root
load_dotenv()

class Settings:
    # Database
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/product_inventory")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "product_inventory")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", 60))

    # App Config
    APP_NAME: str = os.getenv("APP_NAME", "Product Inventory Management System")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_PORT: int = int(os.getenv("APP_PORT", 8000))

# Instantiate settings object
settings = Settings()
