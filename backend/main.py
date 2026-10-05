"""
TripProof: Project-Linked Travel Expense & Tax Intelligence Engine
Main Application Entrypoint (FastAPI)
"""

import sys
from pathlib import Path

# Ensure project root directory is on sys.path regardless of where Python is launched from
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.config import APP_NAME, APP_VERSION, STATIC_DIR, HOST, PORT
from backend.api.routes import router as api_router

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Project-Linked Travel Expense Extraction, Tax Intelligence, and Audit Compliance Engine for Suproc Network OS.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and web portals
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Core API Router
app.include_router(api_router)

# Mount Static UI Assets if built
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve API or static files
        if full_path.startswith("api/"):
            return None
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def index():
        return {
            "app": APP_NAME,
            "version": APP_VERSION,
            "status": "RUNNING",
            "message": "TripProof API is active. Access OpenAPI interactive documentation at /docs",
            "suproc_marketplace": "READY",
            "demo_scenario": "1-Click Seed available at POST /api/v1/demo/reset-seed"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
