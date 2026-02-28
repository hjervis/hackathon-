from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password_hash:  str
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True