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
# Redis Connection (Upstash)
try:
    if REDIS_URL:
        # For Upstash Redis with URL format: redis://<user>:<password>@<host>:<port>
        redis_client = redis.StrictRedis.from_url(
            REDIS_URL,
            ssl=True,
            ssl_cert_reqs=ssl.CERT_NONE,  # Disable SSL verification if needed
            decode_responses=True
        )
    elif UPSTASH_REST_TOKEN:
        # Alternative connection using REST token
        redis_client = redis.StrictRedis(
            host=os.getenv("UPSTASH_REDIS_REST_URL").replace("https://", ""),
            port=6379,
            password=UPSTASH_REST_TOKEN,
            ssl=True,
            ssl_cert_reqs=ssl.CERT_NONE,
            decode_responses=True
        )

    # Test Redis connection
    redis_client.ping()
    print("Successfully connected to Redis!")
except redis.ConnectionError as e:
    print("Redis connection error:", e)
    redis_client = None  # Ensure the variable exists even if connection fails
except Exception as e:
    print("Redis setup error:", e)
    redis_client = None