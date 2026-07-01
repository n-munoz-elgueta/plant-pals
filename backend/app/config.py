import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.environ.get("PLANTS_DATABASE_URL", f"sqlite:///{BASE_DIR / 'plants.db'}")
SECRET_KEY = os.environ.get(
    "PLANTS_SECRET_KEY", "dev-only-secret-key-change-me-before-deploying-0000"
)
TOKEN_EXPIRE_DAYS = 30
