from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Database.database import get_db
from Services import trusted_contactsService
from Schemas.trusted_contactSchema import TrustedContactCreate, ContactStatus

router = APIRouter()

@router.post("/users/{user_id}/contacts")
def create_contact(user_id: int, contact_data: TrustedContactCreate, db: Session = Depends(get_db)):
    return trusted_contactsService.create_contact(db, user_id, contact_data)

@router.get("/users/{user_id}/contacts")
def get_contacts(user_id: int, db: Session = Depends(get_db)):
    return trusted_contactsService.get_contacts(db, user_id)

@router.delete("/users/{user_id}/contacts/{contact_id}")
def delete_contact(user_id: int, contact_id: int, db: Session = Depends(get_db)):
    return trusted_contactsService.delete_contact(db, user_id, contact_id)
