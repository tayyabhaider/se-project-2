from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from dotenv import load_dotenv
import os
from config import SECRET_KEY, redis_client  # import config variables and clients
from routers.authController import auth_routes
from routers.notesController import notes_routes
from routers.searchController import search_routes
from routers.mediaController import media_routes
load_dotenv()  # Ensure env variables are loaded

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY


CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "https://se-project-2.vercel.app"
]}}, supports_credentials=True)

jwt = JWTManager(app)

app.register_blueprint(auth_routes, url_prefix='/auth')
app.register_blueprint(notes_routes, url_prefix='/api')
app.register_blueprint(search_routes, url_prefix='/searches')
app.register_blueprint(media_routes, url_prefix='/media')

if __name__ == '__main__':
    app.run(debug=True)

