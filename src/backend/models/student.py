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

from db_config import db

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    section = db.Column(db.String(10), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='student_profile')
    
    def __repr__(self):
        return f'<Student {self.name}, Roll: {self.roll_number}>' 