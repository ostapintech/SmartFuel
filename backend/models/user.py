from pydantic import BaseModel, Field
from typing import Optional, List

class Anthropometry(BaseModel):
    height: float = Field(..., gt=0, description="Зріст у см")
    weight: float = Field(..., gt=0, description="Вага в кг")
    age: int = Field(..., gt=0, description="Вік у роках")
    gender: str = Field(..., description="Стать")

class UserProfile(BaseModel):
    user_type: str = Field(..., description="Спортсмен (з уточненням виду) або звичайна людина")
    goal: str = Field(..., description="Набір, скидання ваги або утримання")
    target_calories: Optional[int] = Field(None, description="Цільові калорії")
    blood_type: Optional[str] = Field(None, description="Група крові")
    health_conditions: List[str] = Field(default=[], description="Наприклад, діабет, алергії тощо")

class User(BaseModel):
    id: Optional[str] = None
    email: str
    hashed_password: str
    anthropometry: Anthropometry
    profile: UserProfile
    is_active: bool = True

class ProfileUpdateResponse(BaseModel):
    weight: float
    height: float
    birth_year: int
    blood_type: Optional[str] = None
    goal: str