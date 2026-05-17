import json
from openai import OpenAI
from backend.core.config import settings

# Підключаємося до Groq (або OpenAI) через OpenAI-сумісний клієнт
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)


class LLMService:
    @staticmethod
    async def get_allowed_products(profile_data: dict) -> list:
        """
        Отримує JSON з дозволеними продуктами на основі профілю користувача.
        """
        # Додаємо інструкцію про випадковість, щоб ШІ щоразу пропонував нові інгредієнти
        prompt = f"""
        You are a dietary AI assistant. Based on the following user profile, generate a JSON object with a list of allowed and recommended food products.

        CRITICAL REQUIREMENT: 
        Every time you are called, you MUST introduce variety and randomness. Select a diverse, unique, and slightly different sub-set of ingredients (around 15-20 items) from various categories (proteins, carbs, vegetables, healthy fats) that fit the criteria. Avoid generating the exact same list of products twice.

        Ensure the products match the user's category restrictions:
        - Goal: {profile_data.get('goal')}
        - User Type: {profile_data.get('user_type')}
        - Health Conditions: {', '.join(profile_data.get('health_conditions', []))}
        - Blood Type: {profile_data.get('blood_type')}

        Output must be in JSON format with a single key "products" containing a list of strings.
        Example: {{"products": ["chicken breast", "broccoli", "oatmeal"]}}
        """

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Модель від Groq
                messages=[{"role": "user", "content": prompt}],
                # 🔥 Піднімаємо температуру до 0.85, щоб ШІ почав фантазувати та змінювати набір продуктів
                temperature=0.85,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            result = json.loads(content)

            products = result.get("products", [])

            # Додатковий сейв-гард на бекенді (перемішуємо масив про всяк випадок)
            import random
            random.shuffle(products)

            return products
        except Exception as e:
            print(f"Помилка отримання продуктів через LLM: {e}")
            return ["chicken breast", "eggs", "oats", "broccoli", "rice"]  # Дефолтні продукти