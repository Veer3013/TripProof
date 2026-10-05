"""
Hugging Face Spaces & Root App Entrypoint
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import uvicorn
from backend.main import app
from backend.config import HOST, PORT

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
