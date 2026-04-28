import os
import time
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
import jwt
from functools import wraps
from flask import Flask, request, jsonify, render_template_string, send_from_directory
from werkzeug.utils import secure_filename
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from agent import agent_executor
from matching import match_engine, ngo_match_engine, vol_collection
from models import db, User, Drive, Enrollment, Event, EventEnrollment

app = Flask(__name__, static_folder='../dist', static_url_path='/')
# Allow larger file uploads
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 
UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__))

# --- Database & Auth Config ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
_secret_key = os.environ.get('SECRET_KEY')
if not _secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
app.config['SECRET_KEY'] = _secret_key

app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID', '')
db.init_app(app)

with app.app_context():
    db.create_all()

# --- Auth Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({'error': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    prompt = request.form.get('prompt', '')
    image_file = request.files.get('file')

    uploaded_filename = None
    if image_file and image_file.filename:
        filename = secure_filename(image_file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.save(file_path)
        uploaded_filename = filename

    # Build the query
    full_prompt = prompt
    if uploaded_filename:
        # Provide a hint to the agent about the uploaded file
        full_prompt = f"An image file named '{uploaded_filename}' was just uploaded. " + full_prompt

    query = {"messages": [("user", full_prompt)]}
    
    # Run the agent
    try:
        result = agent_executor.invoke(query)
        messages = result["messages"]
        
        # Track if sales_chart.png was generated (simple check)
        chart_generated = False
        chart_path = os.path.join(UPLOAD_FOLDER, 'sales_chart.png')
        if os.path.exists(chart_path):
            # Check if it was modified in the last 10 seconds
            if time.time() - os.path.getmtime(chart_path) < 10:
                chart_generated = True

        # Extract only the final AI message or tool outputs to send back
        response_data = {
            "messages": [],
            "chart_url": "/api/image/sales_chart.png" if chart_generated else None
        }

        for msg in messages:
            # We don't need to send the user's initial message back
            if msg.type == "ai" and msg.content:
                response_data["messages"].append({"role": "ai", "content": msg.content})
            elif msg.type == "tool":
                response_data["messages"].append({"role": "tool", "content": msg.content, "name": msg.name})
            elif msg.type == "ai" and hasattr(msg, "tool_calls") and msg.tool_calls:
                for tool_call in msg.tool_calls:
                    response_data["messages"].append({"role": "tool_call", "name": tool_call["name"], "args": tool_call["args"]})

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/image/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, secure_filename(filename))

@app.route('/api/match', methods=['POST'])
def match_project():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        volunteer_bio = data.get('volunteer_bio', '')
        v_lat = float(data.get('v_lat', 23.2505))
        v_lon = float(data.get('v_lon', 77.4667))
        
        inputs = {
            "volunteer_bio": volunteer_bio,
            "v_lat": v_lat,
            "v_lon": v_lon
        }
        
        result = match_engine.invoke(inputs)
        return jsonify({
            "matched_projects": result.get('matched_projects', []),
            "explanation": result.get('explanation', '')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/match-volunteers', methods=['POST'])
def match_volunteers():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        drive_description = data.get('drive_description', '')
        ngo_lat = float(data.get('ngo_lat', 23.2505))
        ngo_lon = float(data.get('ngo_lon', 77.4667))
        
        inputs = {
            "drive_description": drive_description,
            "ngo_lat": ngo_lat,
            "ngo_lon": ngo_lon
        }
        
        result = ngo_match_engine.invoke(inputs)
        return jsonify({
            "matched_volunteers": result.get('matched_volunteers', []),
            "explanation": result.get('explanation', '')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/register-volunteer', methods=['POST'])
def register_volunteer():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400
        
        vol_id = data.get('id', f"vol_web_{int(time.time())}")
        name = data.get('name', 'Anonymous Volunteer')
        bio = data.get('bio', '')
        lat = float(data.get('lat', 23.2505))
        lon = float(data.get('lon', 77.4667))
        area = data.get('area', 'Unknown')
        
        # Save to ChromaDB
        vol_collection.upsert(
            documents=[bio],
            metadatas=[{"name": name, "area": area, "lat": lat, "lon": lon}],
            ids=[vol_id]
        )
        return jsonify({"success": True, "message": "Volunteer registered successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ocr-volunteer', methods=['POST'])
def ocr_volunteer():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        prompt = f"""
        Target Image: {file_path}
        
        Extract the volunteer's Name, Skills/Bio, and Area/Location from this handwritten form using 'handwriting_ocr'. 
        Then, use the 'register_volunteer_to_db' tool to save them into the database. 
        If the area isn't specifically stated, default the area to 'Bhopal' and coordinates lat: 23.25, lon: 77.41.
        Provide a short confirmation message when done.
        """
        
        inputs = {"messages": [("user", prompt)]}
        messages_output = []
        
        for chunk in agent_executor.stream(inputs, stream_mode="values"):
            message = chunk["messages"][-1]
            if hasattr(message, 'content') and message.content:
                messages_output.append({"role": message.type, "content": message.content})
            elif hasattr(message, 'tool_calls') and message.tool_calls:
                messages_output.append({
                    "role": "tool_call",
                    "name": message.tool_calls[0]['name'],
                    "args": message.tool_calls[0]['args']
                })
        
        return jsonify({"success": True, "messages": messages_output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Authentication Endpoints ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('role') or not data.get('name'):
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
        
    new_user = User(
        email=data['email'],
        role=data['role'],
        name=data['name'],
        ngo_name=data.get('ngo_name'),
        ngo_reg_id=data.get('ngo_reg_id'),
        ngo_details=data.get('ngo_details')
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    
    # If volunteer, register skills in ChromaDB
    if data['role'] == 'volunteer' and data.get('skills'):
        bio = f"Hi, I am {data['name']}. I am skilled in {data['skills']}."
        lat = float(data.get('lat', 23.2505))
        lon = float(data.get('lon', 77.4667))
        area = data.get('area', 'Unknown')
        
        vol_collection.upsert(
            documents=[bio],
            metadatas=[{"name": data['name'], "area": area, "lat": lat, "lon": lon, "user_id": new_user.id}],
            ids=[f"vol_web_{new_user.id}"]
        )
        
    return jsonify({"success": True, "message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': time.time() + (24 * 60 * 60) # 24 hours
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    })

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    """Verify a Google ID token and log in or create the user."""
    data = request.json
    if not data or not data.get('credential'):
        return jsonify({"error": "Missing Google credential"}), 400

    client_id = app.config.get('GOOGLE_CLIENT_ID', '')
    if not client_id:
        return jsonify({"error": "Google OAuth is not configured on the server"}), 500

    try:
        # Verify the token with Google's servers
        id_info = google_id_token.verify_oauth2_token(
            data['credential'],
            google_requests.Request(),
            client_id
        )
    except ValueError as e:
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401

    google_sub = id_info.get('sub')       # unique Google user ID
    email      = id_info.get('email', '')
    name       = id_info.get('name', '')

    # --- Find or create user ---
    user = User.query.filter_by(google_id=google_sub).first()
    is_new_user = False

    if not user:
        # Check if they already registered with email/password
        user = User.query.filter_by(email=email).first()
        if user:
            # Link Google to existing account
            user.google_id = google_sub
            db.session.commit()
        else:
            # Brand-new user — create without role (profile step pending)
            user = User(
                email=email,
                name=name,
                google_id=google_sub,
                role=None,
                profile_complete=False
            )
            db.session.add(user)
            db.session.commit()
            is_new_user = True

    needs_profile = is_new_user or not user.profile_complete

    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': time.time() + (24 * 60 * 60)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "needs_profile": needs_profile,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }), 200

@app.route('/api/auth/complete-profile', methods=['POST'])
@token_required
def complete_profile(current_user):
    """Called after a Google sign-up to save the user's chosen role and profile details."""
    data = request.json
    if not data or not data.get('role'):
        return jsonify({"error": "Role is required"}), 400

    role = data['role']
    if role not in ('volunteer', 'ngo'):
        return jsonify({"error": "Invalid role"}), 400

    current_user.role = role
    current_user.profile_complete = True

    if role == 'ngo':
        current_user.ngo_name    = data.get('ngo_name')
        current_user.ngo_reg_id  = data.get('ngo_reg_id')
        current_user.ngo_details = data.get('ngo_details')
    elif role == 'volunteer':
        skills      = data.get('skills', '')
        preferences = data.get('preferences', '')
        area        = data.get('area', 'Unknown')
        bio = f"Hi, I am {current_user.name}. I am skilled in {skills}."
        if preferences:
            bio += f" Preferred drives: {preferences}"
        # Register in ChromaDB for AI matching
        vol_collection.upsert(
            documents=[bio],
            metadatas=[{"name": current_user.name, "area": area, "lat": 23.2505, "lon": 77.4667, "user_id": current_user.id}],
            ids=[f"vol_web_{current_user.id}"]
        )

    db.session.commit()
    
    token = jwt.encode({
        'user_id': current_user.id,
        'role': current_user.role,
        'exp': time.time() + (24 * 60 * 60)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "success": True, 
        "token": token,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role
        }
    })

# --- Drive Endpoints ---
@app.route('/api/drives', methods=['GET'])
def get_drives():
    drives = Drive.query.filter_by(visibility=True).all()
    result = []
    for d in drives:
        enrolled_count = Enrollment.query.filter_by(drive_id=d.id).count()
        fill = int((enrolled_count / d.slots) * 100) if d.slots > 0 else 0
        result.append({
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "date": d.date,
            "location": d.location,
            "tags": d.tags.split(',') if d.tags else [],
            "hours": d.hours,
            "slots": enrolled_count, # currently enrolled
            "total": d.slots, # total capacity
            "fill": fill,
            "visibility": d.visibility,
            "ngo_name": d.ngo.ngo_name or d.ngo.name
        })
    return jsonify(result)

@app.route('/api/ngo/drives', methods=['GET'])
@token_required
def get_ngo_drives(current_user):
    if current_user.role != 'ngo':
        return jsonify({"error": "Unauthorized"}), 403
        
    drives = Drive.query.filter_by(ngo_id=current_user.id).all()
    result = []
    for d in drives:
        enrolled_count = Enrollment.query.filter_by(drive_id=d.id).count()
        fill = int((enrolled_count / d.slots) * 100) if d.slots > 0 else 0
        result.append({
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "date": d.date,
            "location": d.location,
            "tags": d.tags.split(',') if d.tags else [],
            "hours": d.hours,
            "slots": enrolled_count,
            "total": d.slots,
            "fill": fill,
            "visibility": d.visibility
        })
    return jsonify(result)

@app.route('/api/drives', methods=['POST'])
@token_required
def create_drive(current_user):
    if current_user.role != 'ngo':
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.json
    new_drive = Drive(
        ngo_id=current_user.id,
        title=data['title'],
        description=data.get('desc', ''),
        date=data['date'],
        location=data['location'],
        tags=','.join(data.get('tags', [])),
        hours=int(data.get('hours', 0)),
        slots=int(data.get('total', 10)),
        visibility=data.get('visibility', True)
    )
    db.session.add(new_drive)
    db.session.commit()
    return jsonify({"success": True, "id": new_drive.id})

@app.route('/api/drives/<int:drive_id>/toggle', methods=['POST'])
@token_required
def toggle_drive(current_user, drive_id):
    if current_user.role != 'ngo':
        return jsonify({"error": "Unauthorized"}), 403
        
    drive = Drive.query.get_or_404(drive_id)
    if drive.ngo_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403
        
    drive.visibility = not drive.visibility
    db.session.commit()
    return jsonify({"success": True, "visibility": drive.visibility})

# --- Volunteer Endpoints ---
@app.route('/api/drives/<int:drive_id>/join', methods=['POST'])
@token_required
def join_drive(current_user, drive_id):
    if current_user.role != 'volunteer':
        return jsonify({"error": "Only volunteers can join"}), 403
        
    drive = Drive.query.get_or_404(drive_id)
    existing = Enrollment.query.filter_by(volunteer_id=current_user.id, drive_id=drive.id).first()
    
    if existing:
        # Unenroll
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"success": True, "enrolled": False})
    else:
        # Enroll
        new_enrollment = Enrollment(volunteer_id=current_user.id, drive_id=drive.id)
        db.session.add(new_enrollment)
        db.session.commit()
        return jsonify({"success": True, "enrolled": True})

@app.route('/api/volunteer/stats', methods=['GET'])
@token_required
def get_volunteer_stats(current_user):
    if current_user.role != 'volunteer':
        return jsonify({"error": "Unauthorized"}), 403
        
    enrollments = Enrollment.query.filter_by(volunteer_id=current_user.id).all()
    
    total_hours = sum(e.drive.hours for e in enrollments)
    drive_count = len(enrollments)
    
    enrolled_drive_ids = [e.drive_id for e in enrollments]
    
    return jsonify({
        "hours": total_hours,
        "drives": drive_count,
        "enrolled_ids": enrolled_drive_ids
    })

# --- Event Endpoints ---
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    result = []
    for e in events:
        enrolled_count = EventEnrollment.query.filter_by(event_id=e.id).count()
        result.append({
            "id": e.id,
            "org": e.ngo.ngo_name or e.ngo.name,
            "category": e.category,
            "title": e.title,
            "desc": e.description,
            "date": e.date,
            "time": e.time,
            "location": e.location,
            "slots": e.slots,
            "filled": enrolled_count,
            "tags": e.tags.split(',') if e.tags else [],
            "color": e.color
        })
    return jsonify(result)

@app.route('/api/ngo/events', methods=['GET'])
@token_required
def get_ngo_events(current_user):
    if current_user.role != 'ngo':
        return jsonify({"error": "Unauthorized"}), 403
    events = Event.query.filter_by(ngo_id=current_user.id).all()
    result = []
    for e in events:
        enrolled_count = EventEnrollment.query.filter_by(event_id=e.id).count()
        result.append({
            "id": e.id,
            "title": e.title,
            "desc": e.description,
            "category": e.category,
            "date": e.date,
            "time": e.time,
            "location": e.location,
            "slots": e.slots,
            "filled": enrolled_count,
            "tags": e.tags.split(',') if e.tags else [],
            "color": e.color
        })
    return jsonify(result)

@app.route('/api/events', methods=['POST'])
@token_required
def create_event(current_user):
    if current_user.role != 'ngo':
        return jsonify({"error": "Unauthorized"}), 403
    data = request.json
    new_event = Event(
        ngo_id=current_user.id,
        title=data['title'],
        description=data.get('desc', ''),
        category=data.get('category', 'Social'),
        date=data['date'],
        time=data['time'],
        location=data['location'],
        slots=int(data.get('slots', 50)),
        tags=','.join(data.get('tags', [])),
        color=data.get('color', '#493129')
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"success": True, "id": new_event.id})

@app.route('/api/events/<int:event_id>/register', methods=['POST'])
@token_required
def register_event(current_user, event_id):
    if current_user.role != 'volunteer':
        return jsonify({"error": "Only volunteers can register for events"}), 403
    event = Event.query.get_or_404(event_id)
    existing = EventEnrollment.query.filter_by(volunteer_id=current_user.id, event_id=event.id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"success": True, "enrolled": False})
    else:
        new_enrollment = EventEnrollment(volunteer_id=current_user.id, event_id=event.id)
        db.session.add(new_enrollment)
        db.session.commit()
        return jsonify({"success": True, "enrolled": True})

@app.route('/api/volunteer/events', methods=['GET'])
@token_required
def get_volunteer_events(current_user):
    if current_user.role != 'volunteer':
        return jsonify({"error": "Unauthorized"}), 403
    enrollments = EventEnrollment.query.filter_by(volunteer_id=current_user.id).all()
    enrolled_ids = [e.event_id for e in enrollments]
    return jsonify({"enrolled_ids": enrolled_ids})

if __name__ == '__main__':
    # Start the server
    app.run(host='0.0.0.0', port=5001, debug=True)
