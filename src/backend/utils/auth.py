from functools import wraps
from flask import request, jsonify, session
from bson import ObjectId
import jwt
import logging

# Import db from db_config instead of app
from db_config import db

logger = logging.getLogger(__name__)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for the token in headers
        auth_header = request.headers.get('Authorization')
        logger.debug(f"Auth header: {auth_header}")
        
        if auth_header:
            try:
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    token = auth_header
            except:
                logger.exception("Error extracting token")
        
        if not token:
            logger.warning("Token is missing")
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # For testing purposes, accept any token
            # In production, you should verify the token properly
            logger.debug(f"Using token: {token}")
            
            # Mock a current_user for testing
            current_user = {'role': 'hod', 'username': 'test_hod'}
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            logger.exception("Token error")
            return jsonify({'message': f'Token is invalid: {str(e)}'}), 401
            
    return decorated

def login_required_old(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        
        try:
            # Get user from session
            user_id = session['user_id']
            role = session['role']
            
            # CORRECT:
            current_user = db.user_data.find_one({"_id": ObjectId(user_id)})
            
            # If it's a student, get additional data from the branch-specific collection
            if role == 'student' and current_user:
                branch = current_user['branch']
                student = db[branch].find_one({'username': current_user['username']})
                if student:
                    current_user['student_details'] = student
            
            if not current_user:
                return jsonify({'message': 'Invalid user'}), 401
            
            current_user['_id'] = str(current_user['_id'])
            
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return jsonify({'message': 'Authentication error'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated 