from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)


class MealGeneratorService:
    @staticmethod
    async def generate_meal_plan(allowed_products: list, target_calories: int) -> str:
        """
        Генерує рецепти та раціон на день.
        """
        products_str = ", ".join(allowed_products)
        prompt = f"""
        Create a detailed daily meal plan (Breakfast, Lunch, Dinner, Snack) based on the following products:
        {products_str}

        The total daily caloric intake should be around {target_calories} calories. 
        Provide the recipes, ingredients, and the approximate macros for each meal.
        Keep the tone professional and helpful.
        """

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Помилка генерації рецептів: {e}")
            return "Не вдалося згенерувати раціон через помилку API."