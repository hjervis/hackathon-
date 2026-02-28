from fastapi import HTTPException
from Models.user import User
from sqlalchemy.orm import Session
import bcrypt

def create_user(user_data, db: Session):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Hash password correctly using bcrypt directly
    hashed_password = bcrypt.hashpw(
        user_data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Create User object
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def authenticate_user(email: str, password: str, db: Session):
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    # Verify password correctly using bcrypt directly
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    ):
        return None

    return user