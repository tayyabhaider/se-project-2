import os
import json
import redis
import os
from datetime import timedelta
from flask import Blueprint, request, jsonify, make_response, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
# from flask_login import login_user
from models.users import create_user, verify_user, get_user_by_id, update_password 
from config import redis_client
import logging

auth_routes = Blueprint("auth_routes", __name__)

SESSION_DURATION = 3600  # 1 hour in seconds
SESSION_COOKIE_NAME = "session_id"


@auth_routes.route("/signup", methods=["POST"])
def signup():
    data = request.json
    required_fields = ["username", "email", "password", "name"]
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing fields"}), 400

    user_id = create_user(data["username"], data["email"], data["password"], data["name"])
    if not user_id:
        return jsonify({"msg": "Email already in use"}), 400

    return jsonify({"msg": "User registered", "user_id": user_id}), 201

@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    
    # Validate user credentials
    user = verify_user(email, password)
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    user_id = str(user["_id"])

    username = user["username"] 
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(minutes=15))
    # Create a session in Redis
    session_id = os.urandom(16).hex()
    session_data = {
        "username": username,
        "access_token": access_token
    }
    redis_client.setex(session_id, SESSION_DURATION, json.dumps(session_data))

    # Create a response indicating successful login and set a cookie with the session ID
    response = make_response(jsonify({"msg": "Login successful", "access_token": access_token}), 200)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=SESSION_DURATION,
        httponly=True,
        secure=True,
        samesite="None"
    )
    


    return response

@auth_routes.route("/logout", methods=["POST"])
def logout():
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id:
        redis_client.delete(session_id)
    response = make_response(jsonify({"msg": "Logged out successfully"}), 200)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response

@auth_routes.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.json
    if not update_password(user_id, data['current'], data['next']):
        return jsonify({"msg": "Current password incorrect"}), 400
    return jsonify({"msg": "Password updated"}), 200

@auth_routes.route('/profile', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = get_user_by_id(current_user_id)
    if user:
        return jsonify(name=user['name'], username=user['username'], email=user['email'])
    return jsonify(msg="User not found"), 404