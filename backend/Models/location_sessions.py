from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime, Enum
from Database.database import Base
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint

class LocationSession(Base):
    __tablename__ = "location_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)