from fastapi import APIRouter, HTTPException, Depends
from backend.core.auth import get_current_user
from backend.core.database import db_instance
from backend.services.llm_service import LLMService
from backend.services.meal_generator import MealGeneratorService
from backend.services.openfood_service import OpenFoodService
from backend.schemas.meal_schema import SavedMealPlan
from bson import ObjectId

router = APIRouter()
food_service = OpenFoodService()


@router.post("/generate-and-save")
async def generate_and_save_plan(current_user: dict = Depends(get_current_user)):
    meals_collection = db_instance.db["user_meals"]

    # Міняємо це: дістаємо дані прямо з current_user, а не з profile
    blood_type = current_user.get("blood_type", "Unknown")
    
    # Якщо target_calories немає в базі, ставимо 2000, щоб Pydantic не лаявся
    target_calories = current_user.get("target_calories")
    if target_calories is None:
        target_calories = 2000 

    # Передаємо весь об'єкт користувача в сервіс
    allowed_products = await LLMService.get_allowed_products(current_user)

    meal_text = await MealGeneratorService.generate_meal_plan(
        allowed_products,
        target_calories,
        blood_type
    )
    
    new_plan = SavedMealPlan(
        user_id=str(current_user["_id"]),
        target_calories=target_calories,
        allowed_products=allowed_products,
        meal_plan_text=meal_text
    )

    result = await meals_collection.insert_one(new_plan.model_dump())

    return {
        "message": f"Привіт, {current_user['email']}! Твій план згенеровано.",
        "plan_id": str(result.inserted_id),
        "meal_plan": meal_text
    }
@router.get("/get-plans/{email}")
async def get_meal_plans(email: str):
    meals_collection = db_instance.db["saved_meals"]
    plans = []

    # Вичитуємо всі збережені плани користувача
    async for plan in meals_collection.find({"email": email}):
        plan["_id"] = str(plan["_id"])  # конвертуємо ObjectId для JSON
        plans.append(plan)

    return {"plans": plans}


@router.get("/product/{barcode}")
async def get_product_by_barcode(barcode: str):
    product = await food_service.get_product_by_barcode(barcode)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Продукт за штрих-кодом не знайдено або виникла помилка API",
        )

    return {"product": product}


@router.get("/search")
async def search_food(query: str):
    if not query or len(query) < 3:
        raise HTTPException(status_code=400, detail="Запит має бути не менше 3 символів")

    results = await food_service.search_products_by_name(query)

    if not results:
        return {"message": "Нічого не знайдено", "results": []}

    return {"results": results}


@router.get("/history")
async def get_user_history(current_user: dict = Depends(get_current_user)):
    """
    Повертає історію раціонів лише для поточного користувача.
    """
    meals_collection = db_instance.db["user_meals"]

    # Використовуємо ID з токена для пошуку
    user_id = str(current_user["_id"])

    cursor = meals_collection.find({"user_id": user_id}).sort("created_at", -1)
    history = await cursor.to_list(length=20)

    for item in history:
        item["_id"] = str(item["_id"])

    return {"user": current_user["email"], "history": history}