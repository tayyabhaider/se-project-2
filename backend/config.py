from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import redis
import os
import gridfs
import ssl
load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
MONGO_URI = os.getenv("MONGO_URI")
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))  # Default to 6379 if not set
FLASK_ENV = os.getenv("FLASK_ENV", "development")
VITE_API_URL = os.getenv("VITE_API_URL")
REDIS_URL = os.getenv("REDIS_URL")
UPSTASH_REST_TOKEN = os.getenv("UPSTASH_REST_TOKEN")




uri = MONGO_URI
print("MONGO_URI:", MONGO_URI)
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["note_taking_db"] 
notes_collection = db["notes"]
users_collection = db["users"]
summary_collection = db["summary"]
media_collection = db["media"]
media_fs = gridfs.GridFS(db)


try:
    redis_client = redis.Redis(
    host='true-jawfish-31387.upstash.io',
    port=6379,
    password='AXqbAAIjcDFiOTMwZWVmNjNhNjA0NmIxOTI1NDJjOTg3MTJhYWE3M3AxMA',
    ssl=True,
    decode_responses=True       
    )
    
    # Test the connection
    if redis_client.ping():
        print("✅ Redis connection successful!")
    else:
        raise RuntimeError("Redis ping failed")
        
except Exception as e:
    print(f"❌ Redis connection failed: {str(e)}")


