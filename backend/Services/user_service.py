from Models.user import User
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

def create_user(user_data, db: Session):
    # check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise Exception("User with this email already exists")

    # hash password
    hashed_password = bcrypt.hash(user_data.password)

    # create User object
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone  # make sure this matches DB column
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user