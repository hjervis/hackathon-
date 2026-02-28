from pydantic import BaseModel
from typing import Optional
from datetime import datetime 

class LocationSessionCreate(BaseModel):
    pass   

class LocationSessionResponse(BaseModel):
    id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True
