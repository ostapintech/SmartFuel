from fastapi import APIRouter, HTTPException, status, Depends
from backend.core.auth import get_current_user
# Імпортуй нову схему оновлення
from backend.models.user import ProfileUpdateResponse
from backend.core.database import db_instance

router = APIRouter()


@router.put("/update-profile")
async def update_user_profile(
        payload: ProfileUpdateResponse,  # Використовуємо Pydantic схему замість dict
        current_user: dict = Depends(get_current_user)
):
    users_collection = db_instance.db["users"]

    # Конвертуємо Pydantic модель у словник
    update_data = payload.dict()

    # Оновлюємо поле profile у документі поточного користувача
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile": update_data}}
    )

    return {"message": "Профіль успішно оновлено"}


@router.get("/me")
async def get_current_user_profile(
        current_user: dict = Depends(get_current_user)
):
    """
    Повертає дані поточного авторизованого користувача з бази даних
    """
    users_collection = db_instance.db["users"]

    # Шукаємо користувача в базі за його ID, щоб віддати найсвіжіші дані
    user_in_db = await users_collection.find_one({"_id": current_user["_id"]})

    if not user_in_db:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")

    # Перетворюємо ObjectId на рядок для безпечної серіалізації в JSON
    user_in_db["_id"] = str(user_in_db["_id"])

    # Видаляємо хеш паролю перед відправкою на фронтенд з міркувань безпеки
    if "hashed_password" in user_in_db:
        del user_in_db["hashed_password"]

    return user_in_db