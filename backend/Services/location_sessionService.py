from fastapi import HTTPException
from Models.location_sessions import LocationSession
from Models.user import User 
from datetime import datetime, timezone 
from sqlalchemy.orm import Session

def createLocationsession(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # End any existing active session first
    active_session = db.query(LocationSession).filter(
        LocationSession.user_id == user_id,
        LocationSession.is_active == True
    ).first()

    if active_session:
        active_session.is_active = False
        active_session.ended_at = datetime.now(timezone.utc)
        db.commit()
    
    new_session = LocationSession(user_id=user_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

def end_session(db: Session, user_id: int, session_id: int):
    session = db.query(LocationSession).filter(
        LocationSession.id == session_id,
        LocationSession.user_id == user_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.is_active: 
        raise HTTPException(status_code=400, detail="Session is already ended")
    
    session.is_active = False
    session.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session

def get_active_session(db: Session, user_id: int):
    session = db.query(LocationSession).filter(
        LocationSession.user_id == user_id,
        LocationSession.is_active == True
    ).first() 
    if not session:
        raise HTTPException(status_code=404, detail="No active session found")
    return session 

def get_all_sessions(db: Session, user_id: int):
    return db.query(LocationSession).filter(
        LocationSession.user_id == user_id
    ).all() 


