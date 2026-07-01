import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Household, HouseholdMember, User
from app.schemas import HouseholdCreate, HouseholdOut, JoinRequest, UserOut

router = APIRouter(prefix="/households", tags=["households"])

# No confusable characters (0/O, 1/I/L) so codes are easy to read aloud
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def generate_invite_code(db: Session) -> str:
    while True:
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        if not db.query(Household).filter(Household.invite_code == code).first():
            return code


def household_out(household: Household) -> HouseholdOut:
    return HouseholdOut(
        id=household.id,
        name=household.name,
        invite_code=household.invite_code,
        members=[UserOut.model_validate(m.user) for m in household.members],
    )


def current_membership(user: User, db: Session) -> HouseholdMember | None:
    return db.query(HouseholdMember).filter(HouseholdMember.user_id == user.id).first()


@router.post("", response_model=HouseholdOut, status_code=201)
def create_household(
    body: HouseholdCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_membership(user, db):
        raise HTTPException(400, "You already belong to a household")
    household = Household(name=body.name, invite_code=generate_invite_code(db))
    db.add(household)
    db.flush()
    db.add(HouseholdMember(user_id=user.id, household_id=household.id))
    db.commit()
    db.refresh(household)
    return household_out(household)


@router.post("/join", response_model=HouseholdOut)
def join_household(
    body: JoinRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_membership(user, db):
        raise HTTPException(400, "You already belong to a household")
    household = (
        db.query(Household)
        .filter(Household.invite_code == body.invite_code.strip().upper())
        .first()
    )
    if household is None:
        raise HTTPException(404, "No household found for that invite code")
    db.add(HouseholdMember(user_id=user.id, household_id=household.id))
    db.commit()
    db.refresh(household)
    return household_out(household)


@router.get("/me", response_model=HouseholdOut)
def my_household(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = current_membership(user, db)
    if membership is None:
        raise HTTPException(404, "You are not in a household yet")
    return household_out(membership.household)
