from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime, Enum
from Database.database import Base
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint

class TrustedContacts(Base):
    __tablename__ = "trusted_contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    contact_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20))
    contact_email = Column(String(100))
    status = Column(Enum('pending', 'accepted', 'blocked', 'invited'), default='invited')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint('user_id', 'contact_user_id', name='unique_contact'),
        UniqueConstraint('user_id', 'contact_phone', name='unqiue_phone_contact'),
        UniqueConstraint('user_id', 'contact_email', name='unique_email_contact')
    )
