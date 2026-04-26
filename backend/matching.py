import math
import os
import chromadb
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

# --- 1. CONFIGURATION & PATHING ---
# Dynamically find the path relative to THIS file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "chroma_db")

# Initialize Client
client = chromadb.PersistentClient(path=DB_PATH)
vol_collection = client.get_or_create_collection(name="volunteers")
proj_collection = client.get_or_create_collection(name="projects")

# --- 2. STATE DEFINITION ---
class AgentState(TypedDict):
    volunteer_bio: str
    v_lat: float
    v_lon: float
    matched_projects: List[dict]
    explanation: str

class NgoAgentState(TypedDict):
    drive_description: str
    ngo_lat: float
    ngo_lon: float
    matched_volunteers: List[dict]
    explanation: str

# --- 3. UTILITIES ---
def calculate_haversine(lat1, lon1, lat2, lon2):
    """Calculates the distance in km between two GPS points."""
    R = 6371
    dlat, dlon = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

# --- 4. GRAPH NODES ---
def project_search_node(state: AgentState):
    """Semantic search in ChromaDB."""
    # query_texts handles the embedding conversion automatically
    results = proj_collection.query(
        query_texts=[state['volunteer_bio']], 
        n_results=5
    )
    
    projects = []
    # Safeguard against empty results
    if results['ids'] and results['ids'][0]:
        for i in range(len(results['ids'][0])):
            meta = results['metadatas'][0][i]
            projects.append({
                "id": results['ids'][0][i],
                "title": results['documents'][0][i],
                "lat": meta.get('lat', 23.25), # Default to Bhopal center if missing
                "lon": meta.get('lon', 77.41),
                "ngo_name": meta.get('ngo', 'Partner NGO')
            })
    
    return {"matched_projects": projects}

def proximity_check_node(state: AgentState):
    """Adds distance key and sorts by proximity."""
    projects = state['matched_projects']
    if not projects:
        return {"matched_projects": []}

    for p in projects:
        p['distance'] = round(calculate_haversine(
            state['v_lat'], state['v_lon'], p['lat'], p['lon']
        ), 2)
    
    # Sort closest to furthest
    sorted_projects = sorted(projects, key=lambda x: x['distance'])
    return {"matched_projects": sorted_projects}

def suggestion_node(state: AgentState):
    """Synthesizes the final recommendation."""
    projects = state['matched_projects']
    
    if not projects:
        return {"explanation": "I couldn't find any NGO projects that match your profile in the current database area."}
    
    top = projects[0]
    # Check if we have a semantic match or just a distance match
    explanation = (
        f"Based on your interest in '{state['volunteer_bio']}', "
        f"I recommend joining **{top['ngo_name']}** for their project: '{top['title']}'. "
        f"It is only {top['distance']} km away from you."
    )
    return {"explanation": explanation}

# --- 5. ORCHESTRATION ---
builder = StateGraph(AgentState)

builder.add_node("find_projects", project_search_node)
builder.add_node("check_distance", proximity_check_node)
builder.add_node("suggest", suggestion_node)

builder.set_entry_point("find_projects")
builder.add_edge("find_projects", "check_distance")
builder.add_edge("check_distance", "suggest")
builder.add_edge("suggest", END)

match_engine = builder.compile()

# --- 6. REVERSE MATCHING ORCHESTRATION (NGO -> Volunteers) ---
def volunteer_search_node(state: NgoAgentState):
    """Semantic search for volunteers in ChromaDB."""
    results = vol_collection.query(
        query_texts=[state['drive_description']], 
        n_results=5
    )
    
    volunteers = []
    if results['ids'] and results['ids'][0]:
        for i in range(len(results['ids'][0])):
            meta = results['metadatas'][0][i]
            volunteers.append({
                "id": results['ids'][0][i],
                "bio": results['documents'][0][i],
                "lat": meta.get('lat', 23.25),
                "lon": meta.get('lon', 77.41),
                "name": meta.get('name', 'Volunteer'),
                "area": meta.get('area', 'Unknown')
            })
    return {"matched_volunteers": volunteers}

def vol_proximity_check_node(state: NgoAgentState):
    volunteers = state['matched_volunteers']
    if not volunteers:
        return {"matched_volunteers": []}

    for v in volunteers:
        v['distance'] = round(calculate_haversine(
            state['ngo_lat'], state['ngo_lon'], v['lat'], v['lon']
        ), 2)
    
    sorted_vols = sorted(volunteers, key=lambda x: x['distance'])
    return {"matched_volunteers": sorted_vols}

def vol_suggestion_node(state: NgoAgentState):
    volunteers = state['matched_volunteers']
    if not volunteers:
        return {"explanation": "I couldn't find any volunteers that match your drive requirements in the current database area."}
    
    top = volunteers[0]
    explanation = (
        f"Based on your drive requirements ('{state['drive_description']}'), "
        f"I recommend reaching out to **{top['name']}**. "
        f"They are only {top['distance']} km away and their profile indicates a great match."
    )
    return {"explanation": explanation}

ngo_builder = StateGraph(NgoAgentState)
ngo_builder.add_node("find_volunteers", volunteer_search_node)
ngo_builder.add_node("check_vol_distance", vol_proximity_check_node)
ngo_builder.add_node("suggest_vols", vol_suggestion_node)

ngo_builder.set_entry_point("find_volunteers")
ngo_builder.add_edge("find_volunteers", "check_vol_distance")
ngo_builder.add_edge("check_vol_distance", "suggest_vols")
ngo_builder.add_edge("suggest_vols", END)

ngo_match_engine = ngo_builder.compile()

# --- TEST BLOCK ---
if __name__ == "__main__":
    print(f"--- Debug: Loading DB from {DB_PATH} ---")
    print(f"--- Current DB Count: {proj_collection.count()} ---")
    
    test_input = {
        "volunteer_bio": "Teaching and education for children",
        "v_lat": 23.2505, 
        "v_lon": 77.4667
    }
    
    try:
        final_state = match_engine.invoke(test_input)
        print("\nSuccess! AI Agent Reasoning:")
        print(f"Results Found: {len(final_state['matched_projects'])}")
        print(f"Agent Output: {final_state['explanation']}")
    except Exception as e:
        print(f"Critical Error: {e}")