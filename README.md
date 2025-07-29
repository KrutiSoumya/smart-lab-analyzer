# 🧬 Smart Lab Analyzer

Smart Lab Analyzer is an AI-powered web application that extracts, analyzes, and explains medical lab reports — specifically focusing on Complete Blood Count (CBC) tests like Hemoglobin, WBC, and Platelet Count. It uses OCR to process PDF reports and generates doctor-friendly interpretations and visual trends.

---

## 🚀 Features

- 📄 Upload PDF-based lab reports
- 🤖 OCR extraction using Tesseract
- 🧠 AI-based analysis of Hemoglobin, WBC, and Platelet Count
- 📊 Visual charts for trend tracking
- 🗂 Local storage of past reports
- 🗣 Human-readable medical interpretations
- 🛡 Privacy-first (data stays in your browser)

---

## 🛠️ Tech Stack

| Frontend | Backend |
|---------|---------|
| React.js, Recharts | Flask, Python |
| Axios, CSS | Tesseract OCR, pdf2image |
| localStorage | JSON-based medical rules |

---

## 📂 Project Structure
smart-lab-analyzer/
│
├── frontend/
│ └── App.js, App.css, etc.
│
├── backend/
│ ├── app.py
│ └── explanation_data/
│ └── test_info.json
│
└── README.md


---

## 📦 Setup Instructions

### 1. Clone the repository

git clone https://github.com/KrutiSoumya/smart-lab-analyzer.git
cd smart-lab-analyzer

### 2. Backend setup
cd backend
pip install -r requirements.txt
python app.py

Make sure Tesseract OCR is installed on your system.

### 3. Frontend setup
cd frontend
npm install
npm start

🙋‍♀️ Author
Kruti Soumya
BE Computer Science (Data Science)
Passionate about constructive AI & healthcare tech 🧠💡

📃 License
This project is licensed under the MIT License. Feel free to fork and improve!
