from fastapi import FastAPI
from routes import products

app = FastAPI()

# Register routers
app.include_router(products.router)

@app.get("/")
async def root():
    return {"message": "Backend is running"}
