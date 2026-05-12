from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class SavedMealPlan(BaseModel):
    user_id: str                   # ID користувача з MongoDB
    plan_name: str = "Daily Plan"  # Назва (напр. "План на понеділок")
    target_calories: int
    allowed_products: List[str]
    meal_plan_text: str            # Текст рецептів від LLM
    created_at: datetime = Field(default_factory=datetime.utcnow)