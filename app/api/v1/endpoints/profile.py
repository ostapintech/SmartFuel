from fastapi import APIRouter, HTTPException, status
from app.models.user import UserProfile, Anthropometry
from app.core.database import db_instance

router = APIRouter()


@router.patch("/update/{email}")
async def update_profile(email: str, profile_data: UserProfile):
    users_collection = db_instance.db["users"]

    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"profile": profile_data.model_dump()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")

    return {"message": "Профіль успішно оновлено"}