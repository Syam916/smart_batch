from flask import Flask, request, jsonify, session
from flask_cors import CORS
from bson import ObjectId
import datetime
import os,bcrypt
import logging
 
 
# Import db from db_config
from db_config import db
 
# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'smartbatch-dev-secret-key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
 
# Import routes
from routes.hod import hod_bp
from routes.student_routes import student_bp
 
# Register blueprints
app.register_blueprint(hod_bp, url_prefix='/api/hod')
app.register_blueprint(student_bp)
 
# Auth routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data['password']
 
    print(password, data['username'])
   
    # Find the user by username
    user = db.user_data.find_one({'username': data['username']})
 
    if not user:
        print("User not found")
        return jsonify({'message': 'User not found'}), 401
 
    # Fix for password validation - handle both string and bytes formats
    stored_password = user['password']
   
    try:
        # If stored_password is already bytes, use it directly
        if isinstance(stored_password, bytes):
            hashed_pw = stored_password
        # If it's a string, encode it to bytes
        else:
            hashed_pw = stored_password.encode('utf-8')
           
        # Now check the password
        if not bcrypt.checkpw(password.encode('utf-8'), hashed_pw):
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Password validation error: {str(e)}")
        return jsonify({'message': 'Authentication error'}), 401
   
    # Store user info in session
    session['user_id'] = str(user['_id'])
    session['username'] = user['username']
    session['role'] = user['role']
   
    return jsonify({
        'user_id': str(user['_id']),
        'username': user['username'],
        'role': user['role']
    })
 
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})
 
# Add this route to your app.py for creating test users
@app.route('/api/setup', methods=['GET'])
def setup():
    # Check if test users already exist
    if db.users.find_one({'username': 'hod_test'}):
        return jsonify({'message': 'Test users already exist'})
   
    # Create test HOD user
    hod_user = {
        'username': 'hod_test',
        'password': 'password',
        'role': 'hod',
        'name': 'Test HOD',
        'branch': 'CSE'
    }
    db.users.insert_one(hod_user)
   
    # Create test student user
    student_user = {
        'username': 'student_test',
        'password': 'password',
        'role': 'student',
        'name': 'Test Student',
        'roll_no': 'CS001'
    }
    student_id = db.users.insert_one(student_user).inserted_id
   
    # Create student record
    student_record = {
        'name': 'Test Student',
        'roll_no': 'CS001',
        'branch': 'CSE',
        'year': '3rd',
        'section': 'A',
        'current_semester': '5',
        'semester_marks': {
            '1': 85,
            '2': 78,
            '3': 92,
            '4': 88
        },
        'average_marks': 85.75,
        'performance_type': 'Topper',
        'team_id': None
    }
    db.students.insert_one(student_record)
   
    return jsonify({'message': 'Test users created successfully'})
 
@app.route('/api/test-db', methods=['GET'])
def test_db():
    # Test connection to database
    try:
        # Get counts from collections
        user_count = db.user_data.count_documents({})
       
        # Get sample data
        sample_user = db.user_data.find_one({})
        if sample_user:
            sample_user['_id'] = str(sample_user['_id'])
            # Don't return the password in the response
            if 'password' in sample_user:
                sample_user['password'] = '***HIDDEN***'
       
        return jsonify({
            'status': 'success',
            'db_name': db.name,
            'collections': db.list_collection_names(),
            'user_count': user_count,
            'sample_user': sample_user
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
 
@app.route('/api/student/data/<username>', methods=['GET'])
def get_student_data(username):
    try:
        # First look up the user in user_data to get their branch
        user = db.user_data.find_one({"username": username})
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Get the branch from user data
        branch = user.get('branch')
        
        if not branch:
            return jsonify({"message": "User branch information missing"}), 400
        
        # Now query the branch-specific collection to get student details
        branch_collection = db[branch.lower()]  # Convert branch to lowercase for collection name
        
        # Find student by username in the branch collection
        student = branch_collection.find_one({"username": username})
        
        if not student:
            return jsonify({"message": f"Student not found in {branch} collection"}), 404
        
        # Convert ObjectId to string for JSON serialization
        student['_id'] = str(student['_id'])
        
        # Add branch information if not already present in student data
        if 'branch' not in student:
            student['branch'] = branch
        
        return jsonify(student)
    except Exception as e:
        print(f"Error fetching student data: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500
 
if __name__ == '__main__':
    app.run(debug=True)