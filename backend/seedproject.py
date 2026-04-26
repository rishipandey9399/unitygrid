import chromadb
import os
import chromadb
import shutil

# NEW STABLE PATH LOGIC

# --- STABLE PATHING ---
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "chroma_db")

# Force delete the directory if it exists to clear the 'File exists' error
if os.path.exists(db_path):
    try:
        shutil.rmtree(db_path)
        print("Cleared old database files.")
    except Exception as e:
        print(f"Warning: Could not clear folder, it might be open elsewhere: {e}")

# Re-create and Initialize
client = chromadb.PersistentClient(path=db_path)
proj_collection = client.get_or_create_collection(name="projects")

# ... rest of your seeding code ...

# Dummy Project Data for Bhopal
projects = [
    # --- Original Data ---
    {"id": "proj_001", "volunteer": "Aarav Sharma", "title": "Teaching Python to slum children.", "metadata": {"ngo": "Aarambh Education", "area": "Indrapuri", "lat": 23.2505, "lon": 77.4667}},
    {"id": "proj_002", "volunteer": "Ananya Verma", "title": "Community tree plantation drive.", "metadata": {"ngo": "Grow Billion Trees", "area": "Arera Colony", "lat": 23.2146, "lon": 77.4321}},
    {"id": "proj_003", "volunteer": "Ishaan Gupta", "title": "Data entry for medical records.", "metadata": {"ngo": "Aarogya Kendra", "area": "Mata Mandir", "lat": 23.2300, "lon": 77.3990}},
    {"id": "proj_004", "volunteer": "Sanya Malhotra", "title": "Social media for animal shelter.", "metadata": {"ngo": "Animal Welfare Society", "area": "Kolar Road", "lat": 23.1800, "lon": 77.4100}},
    {"id": "proj_005", "volunteer": "Rohan Mehra", "title": "Manual survey digitization.", "metadata": {"ngo": "Vikas Samvad", "area": "MP Nagar", "lat": 23.2324, "lon": 77.4300}},

    # --- New 100+ Entries (Education & Literacy) ---
    {"id": "proj_006", "volunteer": "Aditi Rao", "title": "Weekend library management for kids.", "metadata": {"ngo": "Muskaan", "area": "Bawadiya Kalan", "lat": 23.1950, "lon": 77.4520}},
    {"id": "proj_007", "volunteer": "Kunal Kapoor", "title": "Maths tutoring for board exams.", "metadata": {"ngo": "Pratham", "area": "Ayodhya Nagar", "lat": 23.2620, "lon": 77.4720}},
    {"id": "proj_008", "volunteer": "Priya Singh", "title": "Adult literacy workshop.", "metadata": {"ngo": "Eklavya Foundation", "area": "Hoshangabad Road", "lat": 23.1820, "lon": 77.4610}},
    {"id": "proj_009", "volunteer": "Rahul Dixit", "title": "Coding basics for teenage girls.", "metadata": {"ngo": "Arushi", "area": "Shivaji Nagar", "lat": 23.2350, "lon": 77.4250}},
    {"id": "proj_010", "volunteer": "Megha Jain", "title": "Storytelling sessions in Urdu/Hindi.", "metadata": {"ngo": "Aarambh", "area": "Jahangirabad", "lat": 23.2450, "lon": 77.4080}},

    # --- Environment & Sustainability ---
    {"id": "proj_011", "volunteer": "Vikram Seth", "title": "Lake cleanup drive (Upper Lake).", "metadata": {"ngo": "Environmental Planning Org", "area": "Lake View", "lat": 23.2480, "lon": 77.3750}},
    {"id": "proj_012", "volunteer": "Sneha Reddy", "title": "Composting workshop for residents.", "metadata": {"ngo": "Sensed NGO", "area": "Gulmohar", "lat": 23.2010, "lon": 77.4420}},
    {"id": "proj_013", "volunteer": "Amit Mishra", "title": "Installing bird feeders in parks.", "metadata": {"ngo": "Nature Healers", "area": "Chuna Bhatti", "lat": 23.2080, "lon": 77.4120}},
    {"id": "proj_014", "volunteer": "Tanvi Joshi", "title": "Miyawaki forest maintenance.", "metadata": {"ngo": "Grow Billion Trees", "area": "BHEL", "lat": 23.2550, "lon": 77.4820}},
    {"id": "proj_015", "volunteer": "Siddharth Roy", "title": "Solar panel awareness campaign.", "metadata": {"ngo": "Green Energy Trust", "area": "Trilanga", "lat": 23.1950, "lon": 77.4350}},

    # --- Health & Disability Support ---
    {"id": "proj_016", "volunteer": "Ritu Phogat", "title": "Assisting in Braille book printing.", "metadata": {"ngo": "Arushi", "area": "Arera Colony", "lat": 23.2180, "lon": 77.4300}},
    {"id": "proj_017", "volunteer": "Manish Paul", "title": "Blood donation camp logistics.", "metadata": {"ngo": "Red Cross Bhopal", "area": "Hamidia Road", "lat": 23.2650, "lon": 77.4050}},
    {"id": "proj_018", "volunteer": "Swati Deshmukh", "title": "Mental health helpline assistance.", "metadata": {"ngo": "Spandan", "area": "Shakti Nagar", "lat": 23.2420, "lon": 77.4620}},
    {"id": "proj_019", "volunteer": "Akash Chopra", "title": "Mobile clinic inventory management.", "metadata": {"ngo": "Lifeline Foundation", "area": "Teela Jamalpura", "lat": 23.2750, "lon": 77.4120}},
    {"id": "proj_020", "volunteer": "Deepika Das", "title": "Physiotherapy support for elderly.", "metadata": {"ngo": "Anand Dham", "area": "Char Imli", "lat": 23.2250, "lon": 77.4280}},

    # --- Animal Welfare ---
    {"id": "proj_021", "volunteer": "Abhishek Jha", "title": "Stray dog vaccination drive.", "metadata": {"ngo": "Prakriti Hope", "area": "Barkheda", "lat": 23.2380, "lon": 77.4880}},
    {"id": "proj_022", "volunteer": "Kavita Iyer", "title": "Feeding drive for cattle.", "metadata": {"ngo": "Go Seva Samiti", "area": "Karond", "lat": 23.2950, "lon": 77.4150}},
    {"id": "proj_023", "volunteer": "Varun Dhawan", "title": "Rescuing injured urban wildlife.", "metadata": {"ngo": "Snake Helpline", "area": "Van Vihar Road", "lat": 23.2310, "lon": 77.3680}},
    
    # ... Imagine 80+ more entries following this pattern ...
]

# Quick script to generate the remaining 80+ programmatically for your use:
import random

first_names = ["Arjun", "Neha", "Sahil", "Pooja", "Sameer", "Kiran", "Yash", "Riya", "Gaurav", "Divya", "Vivek", "Shalini"]
last_names = ["Shrivastav", "Patidar", "Raghuwanshi", "Choudhary", "Malviya", "Sahu", "Dubey", "Tiwari", "Khan", "Qureshi"]
ngos = ["ANSH Happiness Society", "Sewa Bharti", "Youth For Seva", "Nityaseva Society", "Samarthan", "Vikas Samvad"]
areas = ["Kotra Sultanabad", "Misrod", "Lalghati", "Bairagarh", "Minal Residency", "Ashoka Garden", "Saket Nagar"]
tasks = ["Data entry", "Teaching", "Marketing", "Event Management", "Plantation", "Surveying", "Cleaning"]

for i in range(24, 110):
    vol = f"{random.choice(first_names)} {random.choice(last_names)}"
    projects.append({
        "id": f"proj_{i:03}",
        "volunteer": vol,
        "title": f"{random.choice(tasks)} for community development.",
        "metadata": {
            "ngo": random.choice(ngos),
            "area": random.choice(areas),
            "lat": round(random.uniform(23.18, 23.30), 4),
            "lon": round(random.uniform(77.35, 77.50), 4)
        }
    })

print(f"Total entries: {len(projects)}")

# Upsert into ChromaDB
proj_collection.upsert(
    documents=[p["title"] for p in projects],
    metadatas=[p["metadata"] for p in projects],
    ids=[p["id"] for p in projects]
)

print(f"Successfully seeded {len(projects)} NGO projects in Bhopal!")
print(f"📁 Database located at: {db_path}")