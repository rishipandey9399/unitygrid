import os
import chromadb
import random

# --- STABLE PATHING ---
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "chroma_db")

# Initialize ChromaDB client
client = chromadb.PersistentClient(path=db_path)
vol_collection = client.get_or_create_collection(name="volunteers")

# Clear existing volunteers if needed (optional)
# vol_collection.delete(where={})

# Dummy Volunteer Data
volunteers = []

first_names = ["Arjun", "Neha", "Sahil", "Pooja", "Sameer", "Kiran", "Yash", "Riya", "Gaurav", "Divya", "Vivek", "Shalini"]
last_names = ["Shrivastav", "Patidar", "Raghuwanshi", "Choudhary", "Malviya", "Sahu", "Dubey", "Tiwari", "Khan", "Qureshi"]
areas = ["MP Nagar", "Arera Colony", "Indrapuri", "Kolar Road", "Saket Nagar", "Bawadiya Kalan", "Ayodhya Nagar"]
skills = [
    "Teaching children, mathematics, coding in Python",
    "Medical background, nursing, health checkups",
    "Logistics, event management, heavy lifting",
    "Social media marketing, content creation, photography",
    "Cooking, food distribution, kitchen management",
    "Environmental science, tree plantation, composting",
    "Translation (Hindi/English), writing, storytelling",
    "Animal welfare, dog feeding, veterinary assistance",
    "Data entry, Microsoft Excel, office administration",
    "Psychology, mental health counseling, active listening"
]

for i in range(1, 101):
    vol_name = f"{random.choice(first_names)} {random.choice(last_names)}"
    skill_desc = random.choice(skills)
    area = random.choice(areas)
    
    # Randomly slightly offset from central Bhopal
    lat = round(random.uniform(23.18, 23.30), 4)
    lon = round(random.uniform(77.35, 77.50), 4)
    
    volunteers.append({
        "id": f"vol_{i:03}",
        "name": vol_name,
        "bio": f"I am {vol_name}. I have experience in {skill_desc.lower()}.",
        "metadata": {
            "name": vol_name,
            "area": area,
            "lat": lat,
            "lon": lon
        }
    })

# Add 5 specific volunteers for predictable testing
specific_vols = [
    {"id": "vol_test_1", "name": "Aanya Patel", "bio": "Software developer passionate about teaching Python to kids.", "metadata": {"name": "Aanya Patel", "area": "MP Nagar", "lat": 23.2324, "lon": 77.4300}},
    {"id": "vol_test_2", "name": "Rohan Mehta", "bio": "Experienced cook, willing to help with food distribution.", "metadata": {"name": "Rohan Mehta", "area": "Indrapuri", "lat": 23.2505, "lon": 77.4667}},
    {"id": "vol_test_3", "name": "Lin Hassan", "bio": "Medical student looking for free health camp volunteering.", "metadata": {"name": "Lin Hassan", "area": "Kolar Road", "lat": 23.1800, "lon": 77.4100}},
    {"id": "vol_test_4", "name": "Priya Sharma", "bio": "Digital marketing expert, can manage social media for NGOs.", "metadata": {"name": "Priya Sharma", "area": "Arera Colony", "lat": 23.2146, "lon": 77.4321}},
    {"id": "vol_test_5", "name": "Amit Kumar", "bio": "Nature enthusiast, ready for tree plantation and lake cleanup.", "metadata": {"name": "Amit Kumar", "area": "Saket Nagar", "lat": 23.2100, "lon": 77.4500}},
]
volunteers.extend(specific_vols)

print(f"Total entries: {len(volunteers)}")

# Upsert into ChromaDB
vol_collection.upsert(
    documents=[v["bio"] for v in volunteers],
    metadatas=[v["metadata"] for v in volunteers],
    ids=[v["id"] for v in volunteers]
)

print(f"Successfully seeded {len(volunteers)} volunteers in ChromaDB!")
