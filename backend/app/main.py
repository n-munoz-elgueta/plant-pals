from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import config
from app.database import Base, SessionLocal, engine
from app.routers import auth, households, plants, schedule, species, waterings
from app.seed import seed_species


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_species(db)
    yield


app = FastAPI(title="Plant Co-Parenting API", lifespan=lifespan)

config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=config.MEDIA_DIR), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(households.router)
app.include_router(species.router)
app.include_router(plants.router)
app.include_router(waterings.router)
app.include_router(schedule.router)


@app.get("/health")
def health():
    return {"status": "ok"}
