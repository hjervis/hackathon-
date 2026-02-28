from pydantic import BaseModel
from typing import Optional
from enum import Enum

class LocationSessionCreate(BaseModel):
    is_active: boolean     
