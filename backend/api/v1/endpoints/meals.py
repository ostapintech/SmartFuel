import datetime
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
async def generate_and_save_plan(
        payload: dict = None,  # 🔥 Додаємо payload для прийняття калорій з фронтенду
        current_user: dict = Depends(get_current_user)
):
    meals_collection = db_instance.db["user_meals"]
    payload = payload or {}

    # 1. Спершу перевіряємо, чи прийшли точні калорії (dynamicKcal) з фронтенду
    target_calories = payload.get("target_calories")

    # 2. Якщо фронтенд не передав їх, вираховуємо самостійно (як запасний сейв-гард)
    if not target_calories:
        anthropometry = current_user.get("anthropometry", {})
        profile = current_user.get("profile", {})

        weight = float(profile.get("weight") or anthropometry.get("weight") or 70)
        height = float(profile.get("height") or anthropometry.get("height") or 170)

        age = profile.get("age") or anthropometry.get("age")
        if not age and (profile.get("birth_year") or anthropometry.get("birth_year")):
            birth_year = profile.get("birth_year") or anthropometry.get("birth_year")
            age = datetime.now().year - int(birth_year)
        else:
            age = int(age or 25)

        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5

        # Базові коефіцієнти
        blood_type = profile.get("blood_type", "1")
        blood_mod = 1.05 if blood_type in ["1", "I (0)"] else 0.95

        target_calories = int(bmr * 1.375 * blood_mod)

    # 3. Надійно витягуємо групу крові для логіки промпту
    profile_obj = current_user.get("profile", {})
    blood_type = profile_obj.get("blood_type", "Unknown")

    # 4. Передаємо все в сервіси
    allowed_products = await LLMService.get_allowed_products(current_user)

    # 🔥 Передаємо ТОЧНІ калорії з фронтенду в ШІ!
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
        "message": f"Привіт! Твій план згенеровано на {target_calories} ккал.",
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


@router.get("/meals_history")
async def get_meal_history(current_user: dict = Depends(get_current_user)):
    meals_collection = db_instance.db["user_meals"]

    # Шукаємо всі плани за user_id та сортуємо їх: -1 означає від найновіших до найстаріших
    cursor = meals_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)

    history = []
    async for doc in cursor:
        history.append({
            "id": str(doc["_id"]),
            "target_calories": doc.get("target_calories", 2000),
            "allowed_products": doc.get("allowed_products", []),
            "meal_plan_text": doc.get("meal_plan_text", ""),
            # Конвертуємо дату у рядок, якщо вона є об'єктом datetime
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None
        })

    return {"history": history}