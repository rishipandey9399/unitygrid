import os
from app import app
from models import db, User, Event

with app.app_context():
    db.create_all()
    
    # Check if test NGO exists
    ngo = User.query.filter_by(email='ngo@test.com').first()
    if not ngo:
        ngo = User(
            email='ngo@test.com',
            name='Test NGO',
            role='ngo',
            ngo_name='Test NGO',
            profile_complete=True
        )
        ngo.set_password('password')
        db.session.add(ngo)
        db.session.commit()
        print("Created test NGO")
    else:
        print("Test NGO already exists")

    # Add a sample event
    event = Event.query.filter_by(title='Diwali Party').first()
    if not event:
        event = Event(
            ngo_id=ngo.id,
            title='Diwali Party',
            description='A social gathering for all our volunteers to celebrate Diwali.',
            category='Social',
            date='Nov 1, 2026',
            time='6:00 PM',
            location='Community Center',
            slots=100,
            tags='Social,Celebration',
            color='#493129'
        )
        db.session.add(event)
        db.session.commit()
        print("Created sample event")
    else:
        print("Sample event already exists")
