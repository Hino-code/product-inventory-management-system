import uuid
from pymongo import MongoClient

# Connect to your local MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["product_inventory"]

# Loop through all users
for user in db["users"].find({}):
    if "id" not in user:
        new_id = str(uuid.uuid4())
        db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"id": new_id}}
        )
        print(f"✅ Updated user {user['username']} with new id: {new_id}")

print("🎉 User migration complete!")
