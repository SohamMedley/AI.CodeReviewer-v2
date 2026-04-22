# ⚡ AI.Code Reviewer

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Groq](https://img.shields.io/badge/Groq_Cloud-D4FF00?style=for-the-badge&logo=groq&logoColor=black)

**AI.Code Reviewer** is a robust, 3-tier full-stack web application acting as intelligent middleware between developers and Large Language Models. It converts unstructured, non-deterministic generative AI (LLaMA-3.3-70B) into a strictly structured, reliable REST API for code debugging, auto-fixing, and diagnostic reporting.

## 🚀 Key Features

- **State-Dependent Prompt Routing:** The backend dynamically constructs highly constrained system prompts based on the user's UI toggle states (`Auto-Fix` and `Explain`).

- **Deterministic Delimiter Parsing:** A custom algorithm that injects unique delimiters (`|||SPLIT|||`) into the AI generation process, ensuring the unstructured LLM output is reliably tokenized into structured JSON (Status, Code, Explanation).

- **Smart Notification System:** Context-aware UI that intercepts AI status flags and triggers dynamic toast notifications (e.g., offering an auto-fix if a user only asks for an explanation on broken code).

- **Secure Cloud State Management:** Fully authenticated sessions utilizing `werkzeug.security` for cryptographic password hashing (PBKDF2-SHA256) and MongoDB Atlas for secure history archiving.

- **Rich Developer UI:** Features drag-and-drop file parsing, live syntax highlighting via PrismJS, and safe Markdown rendering via Marked.js.

## 🧠 System Architecture

The project strictly follows the **Model-View-Controller (MVC)** design pattern and principles of **Distributed Computing**:

1. **Client Tier (View):** A lightweight Vanilla JavaScript, HTML, and CSS interface. Handles asynchronous state reactivity and secure DOM manipulation without heavy Virtual DOM libraries.

2. **Application Tier (Controller):** A Python Flask server acting as the orchestrator. It manages session state, evaluates user requests, and executes the deterministic parsing algorithms.

3. **Inference & Data Tier (Model):**
   - **Groq Cloud LPU:** Provides ultra-low latency inference using `llama-3.3-70b-versatile`.
   - **MongoDB Atlas:** A distributed NoSQL cluster securely storing user credentials and session histories.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Custom CSS3, Vanilla JavaScript, PrismJS, Marked.js  
- **Backend:** Python 3, Flask, Werkzeug  
- **Database:** MongoDB Atlas, PyMongo  
- **AI Engine:** Groq API (LLaMA-3.3-70B)

## ⚙️ Local Setup & Installation

### Prerequisites
- Python 3.8+
- MongoDB Atlas Cluster URI
- Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-code-reviewer.git
cd ai-code-reviewer
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add your credentials:

```env
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
```

*(Note: Ensure your Groq API key is correctly referenced in the backend or added to the `.env` file depending on your final deployment structure).*

### 5. Run the Application
```bash
python app.py
```

The application will be live at `http://127.0.0.1:5000/`.

## 🎓 Academic Context

This project was engineered as part of the CSE-AIML curriculum at Bharat College of Engineering (Mumbai University). It practically implements core syllabus concepts including:

- **Cryptography and System Security (CSS):** Secure hashing algorithms and XSS mitigation.  
- **Software Engineering and Project Management (SEPM):** MVC architecture and state-dependent control flow.  
- **Distributed Computing (DC):** Decoupled 3-tier client-server-database communication.

---

*Designed & Engineered by Soham Dharap*
