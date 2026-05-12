from fastapi import APIRouter, HTTPException, status, Depends
from backend.core.auth import get_current_user
from backend.models.user import UserProfile, Anthropometry
from backend.core.database import db_instance

router = APIRouter()


@router.put("/update-profile")
async def update_user_profile(
        new_data: dict,
        current_user: dict = Depends(get_current_user)
):
    users_collection = db_instance.db["users"]

    # Оновлюємо поле profile у документі поточного користувача
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile": new_data}}
    )

    return {"message": "Профіль успішно оновлено"}