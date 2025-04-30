from flask import make_response
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notes import create_note, get_notes_by_user, get_note_by_id, update_note_content, delete_note, get_pdf_note, get_pdf_summary, get_quiz,retrieve_tags, get_markdown_note, text_to_speech, get_saved_summary, SelectAndEnhance, autotag_note
from bson.objectid import ObjectId
from datetime import datetime

notes_routes = Blueprint("notes_routes", __name__)

@notes_routes.route("/notes", methods=["GET"])
@jwt_required()
def get_user_notes():  # Renamed from get_notes to avoid conflict
    user_id = get_jwt_identity()
    notes = get_notes_by_user(user_id)
    processed_notes = []
    for note in notes:
        note['_id'] = str(note['_id'])
        note['created_at'] = note['created_at'].isoformat()
        processed_notes.append(note)
    return jsonify(processed_notes), 200

@notes_routes.route("/notes/<note_id>", methods=["GET"])
@jwt_required()
def get_single_note(note_id):  # New endpoint to get single note

    print("note_id: ",note_id)


    user_id = get_jwt_identity()

    print("user id:", user_id)

    note = get_note_by_id(note_id)

    print("note over here", note)
    if note and note['user_id'] == user_id:
        note['_id'] = str(note['_id'])
        note['created_at'] = note['created_at'].isoformat()

        print("note before sending:", note)
        return jsonify(note), 200
    return jsonify({"msg": "Note not found"}), 404

@notes_routes.route("/notes/create", methods=["POST"])
@jwt_required()
def create_note_route():
    data = request.json
    user_id = get_jwt_identity()
    note_id = create_note(
        user_id=user_id,
        title=data['title'],
        content=data.get('content', '')  # Fixed syntax: data.get() not data.get[]
    )
    response = jsonify({"note_id": str(note_id)}), 201

    return response

@notes_routes.route("/notes/<note_id>", methods=["PUT"])
@jwt_required()
def update_note_route(note_id):  
    data = request.json
    user_id = get_jwt_identity()
    
    note = get_note_by_id(note_id)
    if not note or note['user_id'] != user_id:
        return jsonify({"msg": "Note not found"}), 404
    
    update_note_content(note_id, data['content'])
    return jsonify({"msg": "Note updated"}), 200

@notes_routes.route("/notes/<note_id>", methods=["DELETE"])
@jwt_required()
def delete_note_route(note_id):
    user_id = get_jwt_identity()
    
    note = get_note_by_id(note_id)
    if not note or note['user_id'] != user_id:
        return jsonify({"msg": "Note not found"}), 404
    
    delete_note(note_id)
    return jsonify({"msg": "Note deleted"}), 200




@notes_routes.route("/notes/<note_id>/pdf", methods=["GET"])
def get_pdf_note_route(note_id):
    return get_pdf_note(note_id)  


@notes_routes.route("/notes/<note_id>/markdown", methods=["GET"])
def get_markdown_note_route(note_id):
    return get_markdown_note(note_id)  


@notes_routes.route("/notes/<note_id>/summary", methods=["GET"])
def handle_get_summary(note_id):
    return get_pdf_summary(note_id)

@notes_routes.route("/notes/<note_id>/saved_summary", methods=["GET"])
def fetch_summary(note_id):
    return get_saved_summary(note_id)


@notes_routes.route("/notes/<note_id>/quiz", methods=["GET"])
def handle_quizit(note_id):
   return get_quiz(note_id)

@notes_routes.route("/notes/<note_id>/tts", methods=["GET"])
def text_to_speech_route(note_id):
   return text_to_speech(note_id)


@notes_routes.route("/notes/<note_id>/autotag", methods=["POST"])
def Autotagcontroller(note_id):
   return autotag_note(note_id)


@notes_routes.route("/notes/<note_id>/gettags", methods=["GET"])
def GetAutotagcontroller(note_id):
   return retrieve_tags(note_id)

from flask import request

@notes_routes.route("/notes/<note_id>/prompt_enhance", methods=["POST"])
def prompt_enhance(note_id):
    data = request.get_json()
    prompt = data.get("prompt", "")
    return SelectAndEnhance(note_id, prompt)
