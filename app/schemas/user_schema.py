from pydantic import BaseModel, EmailStr
from app.models.user import Anthropometry, UserProfile

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    anthropometry: Anthropometry
    profile: UserProfile

class UserResponse(BaseModel):
    email: EmailStr
    anthropometry: Anthropometry
    profile: UserProfile
    is_active: bool = True

    class Config:
        from_attributes = True