"""
TripProof Root Launcher
Run directly: python run.py
"""

import sys
from pathlib import Path

# Add current directory to Python module search path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from backend.main import app
from backend.config import HOST, PORT

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Launching TripProof Engine for Suproc Network OS")
    print(f"📍 Web Dashboard: http://localhost:{PORT}")
    print(f"📄 Interactive API Docs: http://localhost:{PORT}/docs")
    print("=" * 70)
    uvicorn.run(app, host=HOST, port=PORT)
