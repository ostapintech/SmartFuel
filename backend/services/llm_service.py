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
        prompt = f"""
        You are a dietary AI assistant. Based on the following user profile, generate a JSON object with a list of allowed and recommended food products.
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
                temperature=0.2,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            result = json.loads(content)
            return result.get("products", [])
        except Exception as e:
            print(f"Помилка отримання продуктів через LLM: {e}")
            return ["chicken breast", "eggs", "oats", "broccoli", "rice"]  # Дефолтні продукти на випадок помилки