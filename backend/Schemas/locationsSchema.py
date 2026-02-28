
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationCreate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationResponse(BaseModel):
    id: int
    user_id: int
    session_id: Optional[int] = None
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True