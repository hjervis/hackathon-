from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ContactStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"
    invited = "invited"

class TrustedContactCreate(BaseModel):
    contact_user_id: Optional[int] = None
    contact_name: str
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    status: Optional[ContactStatus] = ContactStatus.invited

class TrustedContactResponse(BaseModel):
    id: int
    user_id: int
    contact_user_id: Optional[int] = None
    contact_name: str
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    status: Optional[ContactStatus] = None

    class Config:
        from_attributes = True
    
