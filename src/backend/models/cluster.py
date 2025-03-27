from .. import db

class Cluster(db.Model):
    __tablename__ = 'clusters'
    
    id = db.Column(db.Integer, primary_key=True)
    cluster_name = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    section = db.Column(db.String(10), nullable=False)
    
    def __repr__(self):
        return f'<Cluster {self.cluster_name}, Branch: {self.branch}, Year: {self.year}, Section: {self.section}>' 