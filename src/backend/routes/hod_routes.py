from flask import Blueprint, request, jsonify
from db_config import db
import bcrypt

hod_bp = Blueprint('hod', __name__)

@hod_bp.route('/api/hod/signup', methods=['POST'])
def hod_signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'branch', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if username already exists
        if db.user_data.find_one({'username': data['username']}):
            return jsonify({"error": "Username already exists"}), 400
            
        # Check if email already exists
        if db.user_data.find_one({'email': data['email']}):
            return jsonify({"error": "Email already exists"}), 400
            
        # Verify that role is 'hod'
        if data['role'] != 'hod':
            return jsonify({"error": "Invalid role specified"}), 400
            
        # Hash the password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create HOD document
        hod_data = {
            'username': data['username'],
            'email': data['email'],
            'password': hashed_password.decode('utf-8'),  # Store as string
            'role': 'hod',
            'branch': data['branch']
        }
        
        # Insert into user_data collection
        result = db.user_data.insert_one(hod_data)
        
        return jsonify({
            "message": "HOD account created successfully",
            "id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error in HOD signup: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500 