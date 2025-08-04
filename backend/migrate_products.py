import uuid
from pymongo import MongoClient

# Connect to your local MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["product_inventory"]

# Loop through all products in the collection
for product in db["products"].find({}):
    if "id" not in product:
        new_id = str(uuid.uuid4())
        db["products"].update_one(
            {"_id": product["_id"]},
            {"$set": {"id": new_id}}
        )
        print(f"✅ Updated product {product['_id']} with new id: {new_id}")

print("🎉 Migration complete!")
