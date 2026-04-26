import os
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
import pytesseract
# --- CHANGED: Use the LangChain-specific Google wrapper ---
from langchain_google_genai import ChatGoogleGenerativeAI 
from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL
from langgraph.prebuilt import create_react_agent
import time
from matching import vol_collection

# --- 1. CONFIGURATION ---
# Use your actual key here
if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "AIzaSyAvLF28ohcjSTQOYEJmdvaoiA0EkDGxjy8"
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- 2. TOOL DEFINITIONS ---

@tool
def handwriting_ocr(image_path: str) -> str:
    """
    Extracts text from an image file using Tesseract OCR.
    Use this first to get the raw data from the project or volunteer images.
    """
    if not os.path.exists(image_path):
        return f"Error: File '{image_path}' not found."
    
    try:
        img = Image.open(image_path)
        # psm 6 assumes a single uniform block of text
        text = pytesseract.image_to_string(img, config='--psm 6')
        return text if text.strip() else "OCR complete, but no text detected."
    except Exception as e:
        return f"OCR Error: {e}"

@tool
def data_analyst_python(code: str) -> str:
    """
    Executes Python code for data processing and visualization.
    Use this to: 
    1. Convert OCR text into a Pandas DataFrame.
    2. Clean/Drop missing values.
    3. Generate Matplotlib charts and save them as .png files.
    """
    python_repl = PythonREPL()
    clean_code = code.strip().replace("```python", "").replace("```", "")
    return python_repl.run(clean_code)

@tool
def register_volunteer_to_db(name: str, bio: str, area: str, lat: float, lon: float) -> str:
    """
    Registers a volunteer into the ChromaDB matching engine.
    Use this to save volunteer information extracted from forms or images.
    """
    try:
        vol_id = f"vol_ocr_{int(time.time())}"
        vol_collection.upsert(
            documents=[bio],
            metadatas=[{"name": name, "area": area, "lat": lat, "lon": lon}],
            ids=[vol_id]
        )
        return f"Success: Volunteer '{name}' registered to database."
    except Exception as e:
        return f"Database Error: {e}"

# --- 3. AGENT INITIALIZATION ---

# --- FIXED: Use ChatGoogleGenerativeAI for LangGraph compatibility ---
llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    temperature=0.1,
    google_api_key=os.environ["GOOGLE_API_KEY"]
)

tools = [handwriting_ocr, data_analyst_python, register_volunteer_to_db]
agent_executor = create_react_agent(llm, tools)

# --- 4. EXECUTION LOGIC ---

def run_analysis_pipeline(image_file):
    print(f"--- Initiating Pipeline for: {image_file} ---")
    
    # Improved prompt to ensure the agent uses tools correctly
    prompt = f"""
    Target Image: {image_file}
    
    Act as a Senior Data Scientist. Perform the following end-to-end pipeline:

    1. EXTRACTION: 
       - Use 'handwriting_ocr' on '{image_file}'.
       - Extract Name, Phone, Email, and Shift availability.

    2. DATA ENGINEERING:
       - Use 'data_analyst_python' to convert the text into a Pandas DataFrame.
       - Standardize columns to: ['Name', 'Phone', 'Email', 'Shift'].
       - Save the cleaned DataFrame as 'volunteer_data.csv'.

    3. VISUALIZATION:
       - Use 'data_analyst_python' to create a dashboard with two charts:
         A) Bar Chart: Count of volunteers by Shift.
         B) Pie Chart: Distribution of area codes from Phone numbers.
       - Save the dashboard as 'volunteer_dashboard_v1.png'.

    4. SUMMARY:
       - Provide a brief confirmation and show the first 5 rows.
    """
    
    inputs = {"messages": [("user", prompt)]}
    
    try:
        # Note: In newer LangGraph versions, stream yields dictionaries
        for chunk in agent_executor.stream(inputs, stream_mode="values"):
            message = chunk["messages"][-1]
            message.pretty_print()
    except Exception as e:
        print(f"Pipeline Error: {e}")

if __name__ == "__main__":
    # Ensure this matches the actual file on your disk
    target = "Gemini_Generated_Image_9wkbcd9wkbcd9wkb_1.png"
    if os.path.exists(target):
        run_analysis_pipeline(target)
    else:
        print(f"File not found: {target}")