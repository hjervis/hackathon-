from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from Schemas.userSchema import UserCreate, UserResponse
from Database.database import get_db
from Services.user_service import create_user  # service that talks to DB

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(user, db)
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "phone": new_user.phone,
        "created_at": new_user.created_at,
    }


