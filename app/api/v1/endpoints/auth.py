from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user_schema import UserCreate, UserResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import db_instance
from passlib.context import CryptContext
from app.core.auth import create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = db_instance.db["users"]

    # form_data.username — це те, що ви ввели в поле username (ваш email)
    user = await users_collection.find_one({"email": form_data.username})

    if not user or not pwd_context.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")

    # Створюємо токен
    access_token = create_access_token(data={"sub": user["email"]})

    # ВАЖЛИВО: OAuth2 стандарт вимагає повертати саме такі ключі:
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }