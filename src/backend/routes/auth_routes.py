from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
import bcrypt
from db_config import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Username and password required'}), 400
    
    username = data['username']
    password = data['password']
    
    # Print for debugging
    print(f"Login attempt: {username}")
    
    # Look in user_data collection for the user
    user = db.user_data.find_one({'username': username})
    
    if not user:
        print(f"User not found: {username}")
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Check if the password is stored as a bcrypt hash
    stored_password = user['password']
    
    # Debug the type of stored password
    print(f"Stored password type: {type(stored_password)}")
    
    # If the stored password starts with $2b$, it's a bcrypt hash
    if stored_password.startswith('$2b$') or stored_password.startswith('$2a$'):
        # Use bcrypt.checkpw to check the password
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
    else:
        # Try direct comparison (not recommended, but might be needed if passwords weren't hashed)
        is_valid = (password == stored_password)
    
    if not is_valid:
        print(f"Invalid password for user: {username}")
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Set session variables
    session['user_id'] = str(user['_id'])
    session['role'] = user['role']
    session['username'] = user['username']
    
    # Return success message with user info
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'role': user['role'],
            'branch': user.get('branch')
        }
    }), 200 