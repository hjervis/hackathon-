from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Database.database import get_db
from Services import location_sessionService

router = APIRouter()

@router.post("/users/{user_id}/sessions")
def create_session(user_id: int, db: Session = Depends(get_db)):
    return location_sessionService.createLocationsession(db, user_id)

@router.put("/users/{user_id}/sessions/{session_id}/end")
def end_session(user_id: int, session_id: int, db: Session = Depends(get_db)):
    return location_sessionService.end_session(db, user_id, session_id)

@router.get("/users/{user_id}/sessions/active")
def get_active_session(user_id: int, db: Session = Depends(get_db)):
    return location_sessionService.get_active_session(db, user_id)

@router.get("/users/{user_id}/sessions")
def get_all_sessions(user_id: int, db: Session = Depends(get_db)):
    return location_sessionService.get_all_sessions(db, user_id)