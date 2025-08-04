from fastapi import FastAPI
from routes import auth, products,users

app = FastAPI()

# Register routes
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(users.router)