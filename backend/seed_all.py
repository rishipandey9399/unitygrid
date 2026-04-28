"""
seed_all.py — Full mock data seeder for UnityDrive

Creates:
  • 1 admin user
  • 3 NGO users (with drives and events)
  • 5 volunteer users (with enrollments)
  • ChromaDB entries for AI matching

Run from the backend/ directory:
    python seed_all.py
"""

import os
import sys
import random

# ── ensure we can import app / models ───────────────────────────────────────
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app import app
from models import db, User, Drive, Enrollment, Event, EventEnrollment
from matching import vol_collection

# ── Seed data ────────────────────────────────────────────────────────────────

ADMIN = {
    "email": "superadmin@unitydrive.org",
    "name": "Super Admin",
    "password": "password123",
    "role": "admin",
}

NGOS = [
    {
        "email": "admin@greenearth.org",
        "name": "GreenEarth Coordinator",
        "password": "password123",
        "role": "ngo",
        "ngo_name": "GreenEarth Foundation",
        "ngo_reg_id": "NGO-GE-2019-001",
        "ngo_details": "We work on environmental sustainability through tree plantations, lake cleanups, and composting awareness.",
        "drives": [
            {
                "title": "Upper Lake Cleanup Drive",
                "description": "Join us to clean the banks of the Upper Lake, Bhopal. Gloves and bags provided.",
                "date": "May 10, 2026",
                "location": "Upper Lake, Bhopal",
                "tags": "Environment,Cleanup,Water",
                "hours": 4,
                "slots": 30,
                "visibility": True,
            },
            {
                "title": "Miyawaki Forest Planting",
                "description": "Plant native saplings to restore a mini-forest in BHEL colony.",
                "date": "May 18, 2026",
                "location": "BHEL, Bhopal",
                "tags": "Environment,Plantation",
                "hours": 5,
                "slots": 20,
                "visibility": True,
            },
            {
                "title": "Composting Workshop",
                "description": "Learn and teach composting techniques to apartment-complex residents.",
                "date": "Jun 1, 2026",
                "location": "Gulmohar Colony, Bhopal",
                "tags": "Environment,Workshop",
                "hours": 3,
                "slots": 15,
                "visibility": False,
            },
        ],
        "events": [
            {
                "title": "World Environment Day Celebration",
                "description": "A community event with art, music, and talks on sustainability.",
                "category": "Social",
                "date": "Jun 5, 2026",
                "time": "10:00 AM",
                "location": "Lal Parade Ground, Bhopal",
                "slots": 200,
                "tags": "Environment,Celebration",
                "color": "#2e6b4f",
            }
        ],
    },
    {
        "email": "admin@karuna.org",
        "name": "Karuna Health Admin",
        "password": "password123",
        "role": "ngo",
        "ngo_name": "Karuna Health Society",
        "ngo_reg_id": "NGO-KH-2017-042",
        "ngo_details": "We run free health camps, blood donation drives, and mental health support programs across Bhopal.",
        "drives": [
            {
                "title": "Free Eye Checkup Camp",
                "description": "Assist doctors at our free eye checkup camp for low-income residents.",
                "date": "May 15, 2026",
                "location": "Hamidia Road, Bhopal",
                "tags": "Health,Medical",
                "hours": 6,
                "slots": 25,
                "visibility": True,
            },
            {
                "title": "Blood Donation Drive",
                "description": "Help coordinate our quarterly blood donation drive at Hamidia Hospital.",
                "date": "May 25, 2026",
                "location": "Hamidia Hospital, Bhopal",
                "tags": "Health,Blood Donation",
                "hours": 4,
                "slots": 40,
                "visibility": True,
            },
        ],
        "events": [
            {
                "title": "Mental Health Awareness Workshop",
                "description": "Interactive sessions on recognizing and managing stress and anxiety.",
                "category": "Health",
                "date": "May 20, 2026",
                "time": "3:00 PM",
                "location": "Spandan Center, Bhopal",
                "slots": 80,
                "tags": "Health,Mental Health",
                "color": "#8b597b",
            },
            {
                "title": "Nutrition & Wellness Fair",
                "description": "Free consultations, BMI checks, and healthy cooking demos.",
                "category": "Health",
                "date": "Jun 12, 2026",
                "time": "9:00 AM",
                "location": "MP Nagar, Bhopal",
                "slots": 150,
                "tags": "Health,Nutrition",
                "color": "#efa3a0",
            },
        ],
    },
    {
        "email": "admin@aarambh.org",
        "name": "Aarambh Education Admin",
        "password": "password123",
        "role": "ngo",
        "ngo_name": "Aarambh Education Trust",
        "ngo_reg_id": "NGO-AE-2015-078",
        "ngo_details": "We provide quality education and digital literacy programs to underprivileged children across Madhya Pradesh.",
        "drives": [
            {
                "title": "Weekend Python Teaching Drive",
                "description": "Teach basic Python coding to slum children aged 12-17 at our Indrapuri center.",
                "date": "May 11, 2026",
                "location": "Indrapuri, Bhopal",
                "tags": "Education,Tech,Teaching",
                "hours": 3,
                "slots": 10,
                "visibility": True,
            },
            {
                "title": "Adult Literacy Workshop",
                "description": "Help adults learn to read and write in Hindi at our Jahangirabad center.",
                "date": "May 21, 2026",
                "location": "Jahangirabad, Bhopal",
                "tags": "Education,Literacy",
                "hours": 2,
                "slots": 12,
                "visibility": True,
            },
            {
                "title": "Coding Bootcamp for Girls",
                "description": "A 3-day coding bootcamp for teenage girls focused on web development basics.",
                "date": "Jun 7, 2026",
                "location": "Shivaji Nagar, Bhopal",
                "tags": "Education,Tech,Women Empowerment",
                "hours": 6,
                "slots": 20,
                "visibility": True,
            },
        ],
        "events": [
            {
                "title": "Annual Scholarship Awards",
                "description": "Celebrate our top students and announce scholarship winners for 2026.",
                "category": "Education",
                "date": "Jun 20, 2026",
                "time": "5:00 PM",
                "location": "Ravindra Bhavan, Bhopal",
                "slots": 300,
                "tags": "Education,Awards",
                "color": "#493129",
            }
        ],
    },
]

VOLUNTEERS = [
    {
        "email": "priya.sharma@demo.unitydrive.org",
        "name": "Priya Sharma",
        "password": "password123",
        "role": "volunteer",
        "skills": "Teaching, digital marketing, social media content creation",
        "area": "Arera Colony, Bhopal",
        "lat": 23.2146,
        "lon": 77.4321,
    },
    {
        "email": "rohan.mehta@demo.unitydrive.org",
        "name": "Rohan Mehta",
        "password": "password123",
        "role": "volunteer",
        "skills": "Cooking, food distribution, kitchen management, logistics",
        "area": "Indrapuri, Bhopal",
        "lat": 23.2505,
        "lon": 77.4667,
    },
    {
        "email": "aanya.patel@demo.unitydrive.org",
        "name": "Aanya Patel",
        "password": "password123",
        "role": "volunteer",
        "skills": "Python programming, teaching children, event management",
        "area": "MP Nagar, Bhopal",
        "lat": 23.2324,
        "lon": 77.4300,
    },
    {
        "email": "lin.hassan@demo.unitydrive.org",
        "name": "Lin Hassan",
        "password": "password123",
        "role": "volunteer",
        "skills": "Medical background, nursing, health checkups, blood donation",
        "area": "Kolar Road, Bhopal",
        "lat": 23.1800,
        "lon": 77.4100,
    },
    {
        "email": "amit.kumar@demo.unitydrive.org",
        "name": "Amit Kumar",
        "password": "password123",
        "role": "volunteer",
        "skills": "Environmental science, tree plantation, composting, lake cleanup",
        "area": "Saket Nagar, Bhopal",
        "lat": 23.2100,
        "lon": 77.4500,
    },
]


# ── Seeder ────────────────────────────────────────────────────────────────────

def seed():
    with app.app_context():
        db.create_all()

        created = {"users": 0, "drives": 0, "events": 0, "enrollments": 0}

        # ---- Admin ----
        if not User.query.filter_by(email=ADMIN["email"]).first():
            u = User(
                email=ADMIN["email"],
                name=ADMIN["name"],
                role=ADMIN["role"],
                profile_complete=True,
            )
            u.set_password(ADMIN["password"])
            db.session.add(u)
            db.session.commit()
            created["users"] += 1
            print(f"  ✅ Admin:     {ADMIN['email']}")
        else:
            print(f"  ⚡ Admin already exists: {ADMIN['email']}")

        # ---- NGOs (with drives & events) ----
        ngo_users = []
        for ngo_data in NGOS:
            existing = User.query.filter_by(email=ngo_data["email"]).first()
            if not existing:
                ngo_user = User(
                    email=ngo_data["email"],
                    name=ngo_data["name"],
                    role="ngo",
                    ngo_name=ngo_data["ngo_name"],
                    ngo_reg_id=ngo_data["ngo_reg_id"],
                    ngo_details=ngo_data["ngo_details"],
                    profile_complete=True,
                )
                ngo_user.set_password(ngo_data["password"])
                db.session.add(ngo_user)
                db.session.commit()
                created["users"] += 1
                print(f"  ✅ NGO:       {ngo_data['email']}  ({ngo_data['ngo_name']})")
            else:
                ngo_user = existing
                print(f"  ⚡ NGO already exists: {ngo_data['email']}")

            ngo_users.append((ngo_user, ngo_data))

            # Drives
            for d in ngo_data.get("drives", []):
                if not Drive.query.filter_by(ngo_id=ngo_user.id, title=d["title"]).first():
                    drive = Drive(
                        ngo_id=ngo_user.id,
                        title=d["title"],
                        description=d["description"],
                        date=d["date"],
                        location=d["location"],
                        tags=d["tags"],
                        hours=d["hours"],
                        slots=d["slots"],
                        visibility=d["visibility"],
                    )
                    db.session.add(drive)
                    created["drives"] += 1

            # Events
            for e in ngo_data.get("events", []):
                if not Event.query.filter_by(ngo_id=ngo_user.id, title=e["title"]).first():
                    event = Event(
                        ngo_id=ngo_user.id,
                        title=e["title"],
                        description=e["description"],
                        category=e["category"],
                        date=e["date"],
                        time=e["time"],
                        location=e["location"],
                        slots=e["slots"],
                        tags=e["tags"],
                        color=e["color"],
                    )
                    db.session.add(event)
                    created["events"] += 1

        db.session.commit()

        # ---- Volunteers ----
        vol_users = []
        for v in VOLUNTEERS:
            existing = User.query.filter_by(email=v["email"]).first()
            if not existing:
                vol_user = User(
                    email=v["email"],
                    name=v["name"],
                    role="volunteer",
                    profile_complete=True,
                )
                vol_user.set_password(v["password"])
                db.session.add(vol_user)
                db.session.commit()
                created["users"] += 1
                print(f"  ✅ Volunteer: {v['email']}  ({v['name']})")
            else:
                vol_user = existing
                print(f"  ⚡ Volunteer already exists: {v['email']}")

            # Register in ChromaDB for AI matching
            bio = f"Hi, I am {v['name']}. I am skilled in {v['skills']}. I volunteer in the {v['area']} area."
            try:
                vol_collection.upsert(
                    documents=[bio],
                    metadatas=[{"name": v["name"], "area": v["area"], "lat": v["lat"], "lon": v["lon"], "user_id": vol_user.id}],
                    ids=[f"vol_web_{vol_user.id}"],
                )
            except Exception as e:
                print(f"    ⚠️  ChromaDB upsert failed for {v['name']}: {e}")

            vol_users.append(vol_user)

        # ---- Enrollments: each volunteer joins 2-3 random drives ----
        all_drives = Drive.query.all()
        all_events = Event.query.all()

        for vol_user in vol_users:
            sample_drives = random.sample(all_drives, min(2, len(all_drives)))
            for drive in sample_drives:
                if not Enrollment.query.filter_by(volunteer_id=vol_user.id, drive_id=drive.id).first():
                    db.session.add(Enrollment(volunteer_id=vol_user.id, drive_id=drive.id))
                    created["enrollments"] += 1

            sample_events = random.sample(all_events, min(1, len(all_events)))
            for event in sample_events:
                if not EventEnrollment.query.filter_by(volunteer_id=vol_user.id, event_id=event.id).first():
                    db.session.add(EventEnrollment(volunteer_id=vol_user.id, event_id=event.id))

        db.session.commit()

        print("\n" + "="*55)
        print(f"  🌱 Seeding complete!")
        print(f"     Users created:       {created['users']}")
        print(f"     Drives created:      {created['drives']}")
        print(f"     Events created:      {created['events']}")
        print(f"     Enrollments added:   {created['enrollments']}")
        print("="*55)
        print("\n  🔑 Demo login credentials (password: password123)")
        print("     Admin:     superadmin@unitydrive.org")
        print("     NGO:       admin@greenearth.org")
        print("     NGO:       admin@karuna.org")
        print("     NGO:       admin@aarambh.org")
        print("     Volunteer: priya.sharma@demo.unitydrive.org")
        print("     Volunteer: aanya.patel@demo.unitydrive.org")
        print("     Volunteer: lin.hassan@demo.unitydrive.org")
        print("="*55)


if __name__ == "__main__":
    print("\n🌱 Seeding UnityDrive database...\n")
    seed()
