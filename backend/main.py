from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, products, users, orders, reports, dashboard, categories  # <-- added categories

app = FastAPI()

# Initialize FastAPI-Cache
FastAPICache.init(InMemoryBackend(), prefix="inventory-cache")

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(categories.router)  # <-- added here
app.include_router(products.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
