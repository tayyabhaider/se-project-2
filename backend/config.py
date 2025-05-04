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
# redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
# redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=True)
# config.py (updated Redis connection)
try:
    redis_client = redis.Redis.from_url(
        os.getenv("REDIS_URL"),  # Should start with rediss://
        decode_responses=True,
        ssl=True,  # Explicitly enable SSL
        ssl_cert_reqs=None  # Disable certificate verification for now
    )
    # else:
    #     # Fallback for older Redis versions
    #     redis_client = redis.Redis(
    #         host=os.getenv("REDIS_HOST", "localhost"),
    #         port=int(os.getenv("REDIS_PORT", 6379)),
    #         decode_responses=True
    #     )
    
    redis_client.ping()
    print("Redis connection successful!")
except redis.ConnectionError as e:
    print("Redis connection failed:", str(e))
    redis_client = None