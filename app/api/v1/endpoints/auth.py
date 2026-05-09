from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import UserCreate, UserResponse
from app.core.database import db_instance
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users_collection = db_instance.db["users"]

    # Перевірка наявності користувача
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Користувач з таким email вже існує."
        )

    # Хешування пароля
    hashed_password = pwd_context.hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = hashed_password

    # Видаляємо звичайний пароль перед збереженням
    del user_dict["password"]

    # Зберігання в базу
    result = await users_collection.insert_one(user_dict)

    # Повертаємо дані без пароля
    return user_dict