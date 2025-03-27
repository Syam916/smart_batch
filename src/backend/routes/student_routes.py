from flask import Blueprint, request, jsonify
from bson import ObjectId
import json


# Import your database configuration
from db_config import db

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/api/students/recent', methods=['GET'])
def get_recent_students():
    try:
        # Get the 10 most recently added students from all branch collections
        recent_students = []
        collections = ['cse', 'ece', 'mech', 'civil', 'eee']
        
        for collection in collections:
            if collection in db.list_collection_names():
                # Get students from this branch, sort by _id in descending order (most recent first)
                branch_students = list(db[collection].find().sort('_id', -1).limit(10))
                for student in branch_students:
                    student['_id'] = str(student['_id'])
                recent_students.extend(branch_students)
        
        # Sort all students by _id in descending order and take the 10 most recent
        recent_students.sort(key=lambda x: ObjectId(x['_id']), reverse=True)
        recent_students = recent_students[:10]
        
        return jsonify(recent_students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route('/api/students', methods=['GET'])
def get_students():
    try:
        # Get students from all branch collections
        students = []
        collections = ['cse', 'ece', 'mech', 'civil', 'eee']
        
        for collection in collections:
            if collection in db.list_collection_names():
                branch_students = list(db[collection].find())
                for student in branch_students:
                    student['_id'] = str(student['_id'])
                students.extend(branch_students)
        
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route('/api/students', methods=['POST'])
def add_student():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'rollNumber', 'branch', 'year', 'section']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create student document - directly use the provided data
        # This keeps all sem1, sem2, etc. fields at the root level as shown in MongoDB
        student = data

        print(student)
        
        # Insert into the collection based on branch
        collection_name = data['branch']
        print(collection_name)
        result = db[collection_name].insert_one(student)
        print(result)
        
        return jsonify({"message": "Student added successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    try:
        # Try to find student in each branch collection
        collections = ['cse', 'ece', 'mech', 'civil', 'eee']
        student = None
        
        for collection in collections:
            if collection in db.list_collection_names():
                student = db[collection].find_one({"_id": ObjectId(student_id)})
                if student:
                    break
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        student['_id'] = str(student['_id'])
        return jsonify(student)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

