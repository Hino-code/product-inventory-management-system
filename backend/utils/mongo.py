from bson import ObjectId

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable dict"""
    if not doc:
        return None
    doc["id"] = str(doc["_id"])   # convert ObjectId to string
    del doc["_id"]                # remove original ObjectId
    return doc

def serialize_list(docs):
    """Convert list of MongoDB docs"""
    return [serialize_doc(doc) for doc in docs]
