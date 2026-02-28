from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from pydantic import BaseModel
from typing import Optional

from pydantic import validator, EmailStr

class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str
    phone: Optional[str] = None

    @validator('password')
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('password must be at least 6 characters')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None  
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @validator('password')
    def password_nonempty(cls, v):
        if not v:
            raise ValueError('password cannot be empty')
        return v