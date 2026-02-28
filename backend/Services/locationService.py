from fastapi import HTTPException
from sqlalchemy.orm import Session
from Models.location import Location
from Models.location_sessions import LocationSession


def save_location(db: Session, user_id: int, lat: float, lng: float, accuracy: float | None = None):
    """Persist a single location reading.

    The location is associated with the user's *currently active* session
    if one exists; otherwise ``session_id`` remains ``None``.
    """
    print(f"[LocationService] Saving location for user {user_id}: lat={lat}, lng={lng}, accuracy={accuracy}")
    
    # optionally grab active session id
    active = db.query(LocationSession).filter(
        LocationSession.user_id == user_id,
        LocationSession.is_active == True,
    ).first()
    
    print(f"[LocationService] Active session: {active.id if active else 'None'}")

    loc = Location(
        user_id=user_id,
        session_id=active.id if active else None,
        latitude=lat,
        longitude=lng,
        accuracy=accuracy,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    print(f"[LocationService] Location saved with ID {loc.id}")
    return loc


def get_session_locations(db: Session, session_id: int):
    return db.query(Location).filter(Location.session_id == session_id).all()
