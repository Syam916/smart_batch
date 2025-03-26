# Student model schema for MongoDB
student_schema = {
    'name': str,
    'roll_no': str,
    'branch': str,  # CSE, IT, ECE, EEE, MECH
    'year': str,  # 1st, 2nd, 3rd, 4th
    'section': str,  # A, B, C, D
    'current_semester': str,  # 1, 2, 3, 4, 5, 6, 7, 8
    'semester_marks': dict,  # {'1': 85, '2': 90, ...}
    'average_marks': float,
    'performance_type': str,  # Topper, Average, Duller
    'team_id': str,  # Reference to cluster team
} 