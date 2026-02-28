from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from Schemas.userSchema import UserCreate, UserResponse, UserLogin
from Database.database import get_db
from Services.user_service import create_user
from Services.user_service import authenticate_user  # service that talks to DB

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

@router.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(credentials.email, credentials.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Generate a fake token for now
    token = "fake-token-for-now"

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "created_at": str(user.created_at),
        },
        "token": token
    }