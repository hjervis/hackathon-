from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy import DECIMAL
from datetime import datetime, timezone
from Database.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("location_sessions.id", ondelete="SET NULL"), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=False)
    longitude = Column(DECIMAL(9, 6), nullable=False)
    accuracy = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))