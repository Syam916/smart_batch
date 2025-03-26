from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.auth import login_required
from utils.clustering import create_balanced_teams
import datetime

hod_bp = Blueprint('hod', __name__)

# Get MongoDB reference from db_config instead of app
from db_config import db

@hod_bp.route('/students', methods=['GET'])
def get_students():
    """Get filtered students"""
    branch = request.args.get('branch')
    year = request.args.get('year')
    section = request.args.get('section')
    
    # Debug the received filters
    print(f"Received filters - branch: {branch}, year: {year}, section: {section}")
    
    # Build the MongoDB query
    query = {}
    if year and year.isdigit():
        query['year'] = int(year)
    if section:
        query['section'] = section
    
    students = []
    
    # If a specific branch is selected, query only that collection
    if branch:
        if branch in db.list_collection_names():
            print(f"Querying {branch} collection with filter: {query}")
            branch_students = list(db[branch].find(query))
            for student in branch_students:
                student['_id'] = str(student['_id'])
                student['branch'] = branch  # Add branch info for display
                students.append(student)
    else:
        # If no branch is selected, query all branch collections
        branch_collections = ['civil', 'cse', 'ece', 'eee', 'mech']
        for branch_name in branch_collections:
            if branch_name in db.list_collection_names():
                print(f"Querying {branch_name} collection with filter: {query}")
                branch_students = list(db[branch_name].find(query))
                for student in branch_students:
                    student['_id'] = str(student['_id'])
                    student['branch'] = branch_name  # Add branch info
                    students.append(student)
    
    print(f"Found {len(students)} students matching the criteria")
    
    return jsonify(students)

def format_student_data(student, semester=None):
    """Format student data to match the expected structure for the frontend"""
    # Extract the core data fields
    formatted = {
        '_id': student['_id'],
        'branch': student.get('branch', ''),
        'name': student.get('username', ''),  # Use username as name
        'roll_no': student.get('email', '').split('@')[0] if student.get('email') else '',
        'section': student.get('section', ''),
        'year': student.get('year', ''),
    }
    
    # Handle semester marks and averages
    sem1 = student.get('sem1', 0)
    sem2 = student.get('sem2', 0)
    
    # Get the average marks
    if 'avgMarks' in student:
        formatted['average_marks'] = student['avgMarks']
    else:
        # Calculate if not present
        total = 0
        count = 0
        if sem1:
            total += sem1
            count += 1
        if sem2:
            total += sem2
            count += 1
        formatted['average_marks'] = total / max(1, count)
    
    # Determine performance type based on average marks
    avg_marks = formatted['average_marks']
    if avg_marks >= 80:
        formatted['performance_type'] = 'Topper'
    elif avg_marks >= 60:
        formatted['performance_type'] = 'Average'
    else:
        formatted['performance_type'] = 'Duller'
    
    # Set the current semester (if needed)
    if semester:
        formatted['current_semester'] = semester
    else:
        formatted['current_semester'] = '1' if sem1 else ('2' if sem2 else '')
    
    return formatted

@hod_bp.route('/student', methods=['POST'])
@login_required
def add_student(current_user):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    branch = data['branch'].lower()  # Convert to lowercase to match collection names
    
    # Calculate average marks and determine performance type
    avg_marks = sum(data['semester_marks'].values()) / len(data['semester_marks'])
    
    if avg_marks >= 80:
        performance_type = 'Topper'
    elif avg_marks >= 60:
        performance_type = 'Average'
    else:
        performance_type = 'Duller'
    
    new_student = {
        'name': data['name'],
        'roll_no': data['roll_no'],
        'year': data['year'],
        'section': data['section'],
        'current_semester': data['current_semester'],
        'semester_marks': data['semester_marks'],
        'average_marks': avg_marks,
        'performance_type': performance_type,
        'team_id': None
    }
    
    # Save to the appropriate branch collection
    if branch in db.list_collection_names():
        result = db[branch].insert_one(new_student)
        return jsonify({'message': 'Student added successfully', 'id': str(result.inserted_id)})
    else:
        return jsonify({'message': f'Branch collection {branch} not found'}), 400

@hod_bp.route('/student/<id>', methods=['PUT'])
@login_required
def update_student(current_user, id):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Calculate average marks and determine performance type
    avg_marks = sum(data['semester_marks'].values()) / len(data['semester_marks'])
    
    if avg_marks >= 80:
        performance_type = 'Topper'
    elif avg_marks >= 60:
        performance_type = 'Average'
    else:
        performance_type = 'Duller'
    
    db.students.update_one(
        {'_id': ObjectId(id)},
        {'$set': {
            'name': data['name'],
            'roll_no': data['roll_no'],
            'branch': data['branch'],
            'year': data['year'],
            'section': data['section'],
            'current_semester': data['current_semester'],
            'semester_marks': data['semester_marks'],
            'average_marks': avg_marks,
            'performance_type': performance_type
        }}
    )
    
    return jsonify({'message': 'Student updated successfully'})

@hod_bp.route('/student/<id>', methods=['DELETE'])
@login_required
def delete_student(current_user, id):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.students.delete_one({'_id': ObjectId(id)})
    
    return jsonify({'message': 'Student deleted successfully'})

@hod_bp.route('/create-teams', methods=['POST'])
@login_required
def cluster_students(current_user):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    branch = data['branch']
    year = data['year']
    section = data['section']
    semester = data['semester']
    
    # Get students from the specified criteria
    students = list(db.students.find({
        'branch': branch,
        'year': year,
        'section': section,
        'current_semester': semester
    }))
    
    # Create balanced teams
    teams = create_balanced_teams(students)
    
    # Save teams to database and update student records
    cluster_id = str(ObjectId())
    cluster_data = {
        '_id': ObjectId(cluster_id),
        'branch': branch,
        'year': year,
        'section': section,
        'semester': semester,
        'teams': teams,
        'created_by': current_user['username'],
        'created_at': datetime.datetime.utcnow()
    }
    
    db.clusters.insert_one(cluster_data)
    
    # Update student records with team assignment
    for team_id, team in enumerate(teams):
        for student_id in team:
            db.students.update_one(
                {'_id': ObjectId(student_id)},
                {'$set': {'team_id': f"{cluster_id}_{team_id}"}}
            )
    
    return jsonify({'message': 'Teams created successfully', 'cluster_id': cluster_id})

@hod_bp.route('/clusters', methods=['GET'])
@login_required
def get_clusters(current_user):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    branch = request.args.get('branch')
    year = request.args.get('year')
    section = request.args.get('section')
    semester = request.args.get('semester')
    
    query = {}
    if branch:
        query['branch'] = branch
    if year:
        query['year'] = year
    if section:
        query['section'] = section
    if semester:
        query['semester'] = semester
    
    clusters = list(db.clusters.find(query))
    for cluster in clusters:
        cluster['_id'] = str(cluster['_id'])
    
    return jsonify(clusters)

@hod_bp.route('/filters', methods=['GET'])
@login_required
def get_filters(current_user):
    if current_user['role'] != 'hod':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Print all available collections for debugging
    collections = db.list_collection_names()
    print(f"Available collections: {collections}")
    
    # Define your branch collections - these match what we see in your MongoDB
    branch_collections = ['civil', 'cse', 'ece', 'eee', 'mech']
    branches = [b for b in branch_collections if b in collections]
    
    # Initialize lists for the other filters
    years = []
    sections = []
    semesters = ['1', '2']  # Based on the sem1 and sem2 fields in your data
    
    # Sample each branch collection to get years, sections
    for branch in branches:
        if branch in collections:
            # Extract distinct values from each collection
            branch_years = db[branch].distinct('year')
            branch_sections = db[branch].distinct('section')
            
            # Add unique values to our lists
            years.extend([y for y in branch_years if y not in years and y is not None])
            sections.extend([s for s in branch_sections if s not in sections and s is not None])
    
    # Convert numeric values to strings if needed
    years = [str(y) if isinstance(y, int) else y for y in years if y]
    
    # If we didn't find any data, provide defaults
    if not branches:
        branches = ["cse", "ece", "eee", "mech", "civil"]
    if not years:
        years = ["1", "2", "3", "4"]
    if not sections:
        sections = ["A", "B", "C"]
    
    # Print the results for debugging
    print(f"Filter data - branches: {branches}, years: {years}, sections: {sections}, semesters: {semesters}")
    
    return jsonify({
        'branches': branches,
        'years': years,
        'sections': sections,
        'semesters': semesters
    })

@hod_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to check if the API is accessible"""
    return jsonify({
        'status': 'success',
        'message': 'HOD API is working!',
        'collections': db.list_collection_names()
    }) 