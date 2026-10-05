import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
AUDIT_PACKS_DIR = STORAGE_DIR / "audit_packs"
STATIC_DIR = BASE_DIR / "frontend" / "dist"

# Ensure directories exist
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
AUDIT_PACKS_DIR.mkdir(parents=True, exist_ok=True)

# Application Settings
APP_NAME = "TripProof"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
PORT = int(os.getenv("PORT", 7860))
HOST = os.getenv("HOST", "0.0.0.0")

# Security & Multi-tenancy
DEFAULT_ORG_ID = "org_suproc_enterprise_001"
DEFAULT_ORG_NAME = "Acme Manufacturing India Pvt Ltd"
DEFAULT_ORG_GSTIN = "27AAACA1234A1ZK"
DEFAULT_BASE_CURRENCY = "INR"

# API Keys (from environment)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAi2ufjSBUXAS9UwNPGcOt2t3tyoSmQqRk")
FRANKFURTER_API_URL = "https://api.frankfurter.app"

# Database
DB_PATH = STORAGE_DIR / "tripproof.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
