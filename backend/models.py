from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)  # nullable for Google-only accounts
    google_id = db.Column(db.String(128), unique=True, nullable=True)  # Google OAuth sub
    role = db.Column(db.String(20), nullable=True)  # nullable until profile is completed after Google signup
    profile_complete = db.Column(db.Boolean, default=False)  # False for new Google users pending profile step

    # Profile Info
    name = db.Column(db.String(100), nullable=False)
    
    # NGO specific fields
    ngo_name = db.Column(db.String(150), nullable=True)
    ngo_reg_id = db.Column(db.String(100), nullable=True)
    ngo_details = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Drive(db.Model):
    __tablename__ = 'drives'
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    tags = db.Column(db.String(200)) # comma separated
    hours = db.Column(db.Integer, default=0)
    slots = db.Column(db.Integer, default=10)
    visibility = db.Column(db.Boolean, default=True) # Public/Private
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    ngo = db.relationship('User', backref=db.backref('drives_created', lazy=True))

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    drive_id = db.Column(db.Integer, db.ForeignKey('drives.id'), nullable=False)
    status = db.Column(db.String(20), default='enrolled') # 'enrolled', 'completed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    volunteer = db.relationship('User', backref=db.backref('enrollments', lazy=True))
    drive = db.relationship('Drive', backref=db.backref('enrollments', lazy=True))

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False) # e.g., 'Education', 'Social', 'Health'
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    slots = db.Column(db.Integer, default=50)
    tags = db.Column(db.String(200)) # comma separated
    color = db.Column(db.String(20)) # hex color
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    ngo = db.relationship('User', backref=db.backref('events_created', lazy=True))

class EventEnrollment(db.Model):
    __tablename__ = 'event_enrollments'
    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    status = db.Column(db.String(20), default='registered')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    volunteer = db.relationship('User', backref=db.backref('event_enrollments', lazy=True))
    event = db.relationship('Event', backref=db.backref('event_enrollments', lazy=True))
