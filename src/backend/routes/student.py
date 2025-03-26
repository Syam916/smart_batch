from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.auth import login_required

student_bp = Blueprint('student', __name__)

# Get MongoDB reference from db_config
from db_config import db

@student_bp.route('/profile', methods=['GET'])
@login_required
def get_profile(current_user):
    if current_user['role'] != 'student':
        return jsonify({'message': 'Unauthorized'}), 403
    
    student = db.students.find_one({'roll_no': current_user['roll_no']})
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    student['_id'] = str(student['_id'])
    
    # Get team information if assigned
    team_info = None
    if student['team_id']:
        cluster_id, team_id = student['team_id'].split('_')
        cluster = db.clusters.find_one({'_id': ObjectId(cluster_id)})
        if cluster:
            team = cluster['teams'][int(team_id)]
            team_members = []
            
            for member_id in team:
                member = db.students.find_one({'_id': ObjectId(member_id)})
                if member:
                    team_members.append({
                        'name': member['name'],
                        'roll_no': member['roll_no'],
                        'performance_type': member['performance_type']
                    })
            
            team_info = {
                'team_id': student['team_id'],
                'members': team_members
            }
    
    response = {
        'student': student,
        'team': team_info
    }
    
    return jsonify(response) 