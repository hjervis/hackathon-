from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from Schemas.userSchema import UserCreate, UserLogin
from Database.database import get_db
from Services.user_service import create_user, authenticate_user
from Services.auth_service import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(user, db)

    # Create token immediately — same shape as /login
    # so auth-context.tsx handles both identically
    token = create_access_token({"sub": new_user.email, "id": new_user.id})

    return {
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "phone": new_user.phone,
            "created_at": new_user.created_at,
        },
        "token": token
    }

@router.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(credentials.email, credentials.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "id": user.id})

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "created_at": user.created_at,
        },
        "token": token
    }