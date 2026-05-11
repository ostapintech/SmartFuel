from fastapi import APIRouter, HTTPException
from app.core.database import db_instance
from app.services.llm_service import LLMService
from app.services.meal_generator import MealGeneratorService
from app.services.openfood_service import OpenFoodService
from app.schemas.meal_schema import MealPlanSave

router = APIRouter()
food_service = OpenFoodService()

@router.post("/generate-plan/{email}")
async def generate_meal_plan(email: str):
    users_collection = db_instance.db["users"]

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")

    profile = user.get("profile", {})
    target_calories = profile.get("target_calories", 2000)

    allowed_products = await LLMService.get_allowed_products(profile)
    meal_plan = await MealGeneratorService.generate_meal_plan(
        allowed_products, target_calories
    )

    return {
        "user_email": email,
        "target_calories": target_calories,
        "allowed_products": allowed_products,
        "meal_plan": meal_plan
    }


@router.post("/save-plan")
async def save_meal_plan(plan: MealPlanSave):
    meals_collection = db_instance.db["saved_meals"]
    result = await meals_collection.insert_one(plan.model_dump())
    return {"message": "Раціон успішно збережено", "plan_id": str(result.inserted_id)}


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