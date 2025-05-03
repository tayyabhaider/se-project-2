import os

def generate_secret_key():
    """Generate a random 24-byte hex string."""
    return os.urandom(24).hex()

def create_env_file(env_path=".env"):
    """Creates a .env file with default configuration values."""
    secret_key = generate_secret_key()
    
    # Define default values for other environment variables
    mongo_uri = "mongodb+srv://Tayyab:tayyab1@cluster0.uk6rwuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    redis_host = "localhost"
    redis_port = "6379"
    flask_env = "development"
    VITE_API_URL = "https://se-project-2-kl4u.onrender.com"
    
    env_contents = (
        f"SECRET_KEY={secret_key}\n"
        f"MONGO_URI={mongo_uri}\n"
        f"REDIS_HOST={redis_host}\n"
        f"REDIS_PORT={redis_port}\n"
        f"FLASK_ENV={flask_env}\n"
        f"VITE_API_URL={VITE_API_URL}\n"
    )
    
    with open(env_path, "w") as env_file:
        env_file.write(env_contents)
    
    print(f".env file created at '{env_path}' with the following contents:")
    print(env_contents)

if __name__ == "__main__":
    create_env_file()
