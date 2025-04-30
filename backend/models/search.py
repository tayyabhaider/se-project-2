from config import notes_collection
from datetime import datetime, timezone


def search_notes_by_title(user_id, query):
        notes = notes_collection.find({
        "user_id": user_id,
        "title": {"$regex": query, "$options": "i"}
        }).sort("updated_at", -1)
        notes_list = []
        for note in notes:
            # Convert ObjectId to its string representation
            note['_id'] = str(note['_id'])
            notes_list.append(note)
        return list(notes_list)

def log_search_query(user_id, query):
    notes_collection.db.search.insert_one({
        "user_id": user_id,
        "query": query,
        "search_time": datetime.now(timezone.utc)
    })

def get_recent_searches(user_id, limit=10):
    return list(notes_collection.db.search.find({"user_id": user_id}).sort("search_time", -1).limit(limit))

