from fastapi import HTTPException
from sqlalchemy.orm import Session
from Models.trusted_contacts import TrustedContacts
from Models.user import User
from Schemas.trusted_contactSchema import TrustedContactCreate
from sqlalchemy import or_

def create_contact(db: Session, user_id: int, contact_data: TrustedContactCreate):

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not contact_data.contact_phone and not contact_data.contact_email:
        raise HTTPException(
            status_code=400,
            detail="Must provide at least a phone number or email"
        )

    filters = []

    if contact_data.contact_phone:
        filters.append(
            TrustedContacts.contact_phone == contact_data.contact_phone
        )

    if contact_data.contact_email:
        filters.append(
            TrustedContacts.contact_email == contact_data.contact_email
        )

    if filters:
        existing = db.query(TrustedContacts).filter(
            TrustedContacts.user_id == user_id,
            or_(*filters)
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Contact already exists")

    new_contact = TrustedContacts(
        **contact_data.model_dump(),
        user_id=user_id
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return new_contact

def get_contacts(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(TrustedContacts).filter(TrustedContacts.user_id == user_id).all()


def get_accepted_contact_ids(db: Session, user_id: int) -> list[int]:
    """Return a list of other user IDs that this user has accepted as contacts.

    Only contacts with a non-null ``contact_user_id`` are included because the
    websocket broadcast can only reach registered users.
    """
    rows = (
        db.query(TrustedContacts.contact_user_id)
        .filter(
            TrustedContacts.user_id == user_id,
            TrustedContacts.status == "accepted",
            TrustedContacts.contact_user_id.isnot(None),
        )
        .all()
    )
    # each row is a tuple, extract the first element
    return [r[0] for r in rows]


def delete_contact(db: Session, user_id: int, contact_id: int):
    contact = db.query(TrustedContacts).filter(
        TrustedContacts.id == contact_id,
        TrustedContacts.user_id == user_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()



    


    
    

    
    