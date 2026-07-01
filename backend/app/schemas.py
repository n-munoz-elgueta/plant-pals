from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Auth ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORMModel):
    id: int
    email: EmailStr
    display_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Households ---

class HouseholdCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class JoinRequest(BaseModel):
    invite_code: str = Field(min_length=1, max_length=12)


class HouseholdOut(ORMModel):
    id: int
    name: str
    invite_code: str
    members: list[UserOut]


# --- Species ---

class SpeciesOut(ORMModel):
    id: int
    common_name: str
    scientific_name: str
    suggested_interval_days: int
    care_notes: str


# --- Plants ---

class PlantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    species_id: int | None = None
    water_interval_days: int = Field(ge=1, le=365)
    notes: str = ""


class PlantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    species_id: int | None = None
    water_interval_days: int | None = Field(default=None, ge=1, le=365)
    notes: str | None = None


class PlantOut(ORMModel):
    id: int
    name: str
    species: SpeciesOut | None
    photo_url: str | None
    water_interval_days: int
    notes: str
    created_at: datetime
    last_watered_at: datetime | None
    last_watered_by: str | None
    next_due: date
    status: str


# --- Waterings ---

class WateringCreate(BaseModel):
    watered_at: datetime | None = None
    note: str = ""


class WateringOut(ORMModel):
    id: int
    plant_id: int
    watered_at: datetime
    note: str
    user: UserOut


# --- Schedule ---

class SchedulePlant(BaseModel):
    plant_id: int
    name: str
    photo_url: str | None
    status: str
    next_due: date
    due_dates: list[date]


class ScheduleResponse(BaseModel):
    start: date
    end: date
    plants: list[SchedulePlant]
