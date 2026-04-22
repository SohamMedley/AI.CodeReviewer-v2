import os
from dotenv import load_dotenv
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from groq import Groq
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, PyMongoError
from werkzeug.security import generate_password_hash, check_password_hash

# Load variables from .env file into the environment
load_dotenv()

app = Flask(__name__)
app.secret_key = "soham_cyber_secret_key_change_in_production"

# --- CONFIGURATION ---
GROQ_API_KEY = "GROQ_API_KEY"
client = Groq(api_key=GROQ_API_KEY)

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI")

mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = mongo_client.get_default_database() 
users_collection = db['users']
history_collection = db['history']

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        try:
            if users_collection.find_one({'username': username}):
                flash('Username already exists. Please login.', 'error')
                return redirect(url_for('signup'))
            
            hashed_password = generate_password_hash(password)
            users_collection.insert_one({
                'username': username, 
                'password': hashed_password,
                'created_at': datetime.utcnow()
            })
            flash('Signup successful! Welcome to the system.', 'success')
            return redirect(url_for('login'))
        except ServerSelectionTimeoutError:
            flash('DATABASE ERROR: Could not connect to MongoDB Atlas. Check your internet connection.', 'error')
        except PyMongoError as e:
            flash(f'Database error occurred: {str(e)}', 'error')
            
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        try:
            user = users_collection.find_one({'username': username})
            
            if user and check_password_hash(user['password'], password):
                session['user_id'] = str(user['_id'])
                session['username'] = user['username']
                return redirect(url_for('index'))
                
            flash('Invalid Access Credentials.', 'error')
        except ServerSelectionTimeoutError:
            flash('DATABASE ERROR: Could not connect to MongoDB Atlas.', 'error')
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    try:
        user_history = list(history_collection.find({'user_id': session['user_id']}).sort('timestamp', -1))
        return render_template('dashboard.html', history=user_history)
    except ServerSelectionTimeoutError:
        flash("Could not fetch history. Database connection failed.", "error")
        return render_template('dashboard.html', history=[])

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    code_content = data.get('code')
    auto_fix = data.get('autoFix')
    auto_explain = data.get('autoExplain')

    if not code_content:
        return jsonify({"error": "No code provided"}), 400

    if not auto_fix and not auto_explain:
        return jsonify({
            "fixed_code": code_content,
            "explanation": "No analysis performed. Both Auto-Fix and Explain toggles were disabled.",
            "status": "NONE"
        })

    # --- ADVANCED PROMPT LOGIC WITH STATUS DETECTION ---
    system_instructions = """You are an expert AI Code Reviewer.
    STEP 1: Evaluate the user's code. Determine if it is 'CORRECT' (logic/syntax are fine, might just need formatting) or 'WRONG' (has bugs, errors, or logical flaws).
    STEP 2: You MUST output your response strictly using two '|||SPLIT|||' separators to create exactly three sections.
    
    FORMAT:
    <STATUS> |||SPLIT||| <CODE> |||SPLIT||| <EXPLANATION>
    
    RULES:
    - STATUS: Must be exactly 'CORRECT' or 'WRONG'.
    """
    
    if auto_fix and auto_explain:
        system_instructions += """
        - CODE: Provide the fully fixed, optimized, and properly aligned raw code (NO MARKDOWN). Even if the original code was CORRECT, ensure it is perfectly formatted here.
        - EXPLANATION: 
            - If WRONG: Explain what the specific issues were in the original code AND explain how the current corrected code works.
            - If CORRECT: Explain how the correct code works.
        """
    elif auto_fix and not auto_explain:
        system_instructions += """
        - CODE: Provide the fully fixed, optimized, and properly aligned raw code (NO MARKDOWN). Even if the original code was CORRECT, ensure it is perfectly formatted here.
        - EXPLANATION: Leave completely empty.
        """
    elif not auto_fix and auto_explain:
        system_instructions += """
        - CODE: Output the exact word 'NO_CODE_REQUESTED'.
        - EXPLANATION: 
            - If WRONG: Start your explanation EXACTLY with "**Your input code has issues or errors.**\n\n". Then explicitly list the issues and errors in the code. DO NOT provide the corrected code.
            - If CORRECT: Start your explanation EXACTLY with "**Your input code is correct.**\n\n". Then explain how the code works.
        """

    user_prompt = f"CODE TO ANALYZE:\n{code_content}"

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1, 
            max_tokens=2048,
            top_p=1,
            stop=None,
            stream=False
        )

        text = completion.choices[0].message.content.strip()
        
        # --- 3-PART BULLETPROOF PARSING ---
        parts = text.split("|||SPLIT|||")
        
        status = "WRONG"
        raw_code_part = ""
        explanation = ""

        if len(parts) >= 3:
            status = "CORRECT" if "CORRECT" in parts[0].upper() else "WRONG"
            raw_code_part = parts[1].strip()
            explanation = parts[2].strip()
        elif len(parts) == 2:
            status = "WRONG"
            raw_code_part = parts[0].strip()
            explanation = parts[1].strip()
        else:
            raw_code_part = text
            explanation = "Explanation format error from AI."

        # FORCE overrides based on user toggles
        if not auto_fix:
            fixed_code = code_content # Forcefully restore original code
        else:
            fixed_code = raw_code_part
            if not auto_explain:
                explanation = "" 

        # Cleanup markdown backticks
        if fixed_code.startswith("```"):
            lines = fixed_code.split('\n')
            if len(lines) > 0 and lines[0].strip().startswith("```"):
                lines = lines[1:]
            if len(lines) > 0 and lines[-1].strip() == "```":
                lines = lines[:-1]
            fixed_code = "\n".join(lines).strip()

        # SAVE TO MONGODB
        if 'user_id' in session:
            try:
                history_collection.insert_one({
                    'user_id': session['user_id'],
                    'original_code': code_content,
                    'fixed_code': fixed_code.strip(),
                    'explanation': explanation,
                    'timestamp': datetime.utcnow(),
                    'status': status
                })
            except ServerSelectionTimeoutError:
                print("Warning: Could not save to history. MongoDB Atlas is unreachable.")

        return jsonify({
            "fixed_code": fixed_code.strip(),
            "explanation": explanation,
            "status": status
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
