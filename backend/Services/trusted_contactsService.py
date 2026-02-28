from fastapi import HTTPException
from sqlalchemy.orm import Session
from Models.trusted_contacts import TrustedContact
from Models.user import User
from Schemas.trusted_contactSchema import TrustedContactCreate

def create_contact(db: Session, user_id: int, contact_data: TrustedContactCreate):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check at least phone or email was provided
    if not contact_data.contact_phone and not contact_data.contact_email:
        raise HTTPException(status_code=400, detail="Must provide at least a phone number or email")

    # Check if contact already exists for this user
    existing = db.query(TrustedContact).filter(
        TrustedContact.user_id == user_id,
        TrustedContact.contact_phone == contact_data.contact_phone
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contact already exists")

    # Create the contact
    new_contact = TrustedContact(**contact_data.model_dump(), user_id=user_id)
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


def get_contacts(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(TrustedContact).filter(TrustedContact.user_id == user_id).all()


def delete_contact(db: Session, user_id: int, contact_id: int):
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == user_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()



    


    
    

    
    