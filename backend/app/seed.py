import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Species

SPECIES_FILE = Path(__file__).parent / "seed" / "species.json"


def seed_species(db: Session) -> None:
    if db.query(Species).first() is not None:
        return
    entries = json.loads(SPECIES_FILE.read_text())
    db.add_all(Species(**entry) for entry in entries)
    db.commit()
