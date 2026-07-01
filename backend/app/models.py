from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    membership: Mapped["HouseholdMember | None"] = relationship(back_populates="user")


class Household(Base):
    __tablename__ = "households"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    invite_code: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    members: Mapped[list["HouseholdMember"]] = relationship(back_populates="household")
    plants: Mapped[list["Plant"]] = relationship(back_populates="household")


class HouseholdMember(Base):
    __tablename__ = "household_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"))
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped[User] = relationship(back_populates="membership")
    household: Mapped[Household] = relationship(back_populates="members")


class Species(Base):
    __tablename__ = "species"

    id: Mapped[int] = mapped_column(primary_key=True)
    common_name: Mapped[str] = mapped_column(String(100), index=True)
    scientific_name: Mapped[str] = mapped_column(String(150))
    suggested_interval_days: Mapped[int]
    care_notes: Mapped[str] = mapped_column(Text, default="")


class Plant(Base):
    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(primary_key=True)
    household_id: Mapped[int] = mapped_column(ForeignKey("households.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    species_id: Mapped[int | None] = mapped_column(ForeignKey("species.id"))
    photo_filename: Mapped[str | None] = mapped_column(String(255))
    water_interval_days: Mapped[int]
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    household: Mapped[Household] = relationship(back_populates="plants")
    species: Mapped[Species | None] = relationship()
    waterings: Mapped[list["WateringEvent"]] = relationship(
        back_populates="plant", cascade="all, delete-orphan"
    )


class WateringEvent(Base):
    __tablename__ = "watering_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    watered_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    note: Mapped[str] = mapped_column(Text, default="")

    plant: Mapped[Plant] = relationship(back_populates="waterings")
    user: Mapped[User] = relationship()
