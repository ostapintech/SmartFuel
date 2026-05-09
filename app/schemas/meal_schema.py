from pydantic import BaseModel, EmailStr
from typing import List

class MealPlanSave(BaseModel):
    email: EmailStr
    target_calories: int
    allowed_products: List[str]
    meal_plan: str