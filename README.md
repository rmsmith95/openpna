# OpenPnA
Open Source Pick and Assemble project with a GUI and Software for component assemble

## Introduction
OpenPnA is a open source python project to pick and assemble parts. It provides a FastAPI and React interface to use machines and a range of attachments which can be changed. A job list for the machine to complete in order which defines how to assemble the parts

python3.13

# Run frontend in windows powershell
cd .\frontend
npm install
npm run dev
Open your internet browser and go to "localhost:3000"

# Run backend in separate windows powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
