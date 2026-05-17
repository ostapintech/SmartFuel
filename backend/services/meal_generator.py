from openai import OpenAI
from backend.core.config import settings

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)


class MealGeneratorService:
    @staticmethod
    async def generate_meal_plan(allowed_products: list, target_calories: int, blood_type: str) -> str:
        """
        Генерує рецепти та раціон на день українською мовою з урахуванням групи крові.
        """
        products_str = ", ".join(allowed_products)

        # Специфічні інструкції згідно з теорією груп крові (для задоволення вимог викладача)
        blood_type_logic = ""
        if blood_type in ["2", "A", "А"]:
            blood_type_logic = """
            Дотримуйся дієти для 2-ї групи крові (Тип А):
            - Пріоритет: рослинна їжа, крупи (каші), овочі, фрукти.
            - ОБМЕЖЕННЯ: Повністю виключи червоне м'ясо. 
            - Тваринний білок може бути представлений лише невеликою кількістю риби або кисломолочних продуктів.
            """
        elif blood_type in ["1", "O", "0"]:
            blood_type_logic = """
            Дотримуйся дієти для 1-ї групи крові (Тип O):
            - Пріоритет: білкова їжа, нежирне м'ясо, риба.
            - ОБМЕЖЕННЯ: Обмежуй зернові продукти (крупи) та бобові.
            """
        # Можна додати інструкції для 3 та 4 груп за аналогією

        prompt = f"""
        You are a professional Ukrainian chef and nutritionist. Your task is to create a detailed, realistic, and delicious 1-day meal plan based on the user's data.

        CRITICAL INSTRUCTIONS:
        - You must write STRICTLY in clean, professional Ukrainian language.
        - NO суржик or direct English translations (use "сир фета", "волоські горіхи", NOT "фетовий сир" or "велетенські горіхи").
        - Recipes must be realistic and detailed (write exactly HOW to cook, cut, and mix, not just "conduct heat treatment").
        - Do NOT repeat the exact same ingredients across breakfast, lunch, and dinner.

        Input Data:
        - Allowed Products: {products_str}
        - Target Calories: {target_calories} kcal
        - Blood Type: {blood_type}
        - Specific Rules: {blood_type_logic}

        STRICT OUTPUT FORMAT (Do not include any introductions, notes, or concluding text. Start directly with the first section. Follow the headers EXACTLY as written below. Do NOT repeat the emoji or the word "СНІДАНОК/ОБІД/ВЕЧЕРЯ" inside the data fields):

        СНІДАНОК
        [Апетитна назва страви без слова Сніданок і без емодзі]
        Продукти:
        - [Назва] — [Кількість]г
        - [Назва] — [Кількість]г
        Приготування:
        1. [Детальний перший крок приготування обіду]
        2. [Детальний другий крок приготування обіду]
        3. [Детальний третій крок приготування обіду]
        КБЖВ: [Калорії] ккал | Б: [Грами]г | Ж: [Грами]г | В: [Грами]г

        ОБІД
        [Апетитна назва страви без слова Обід і без емодзі]
        Продукти:
        - [Назва] — [Кількість]г
        Приготування:
        1. [Детальний перший крок приготування обіду]
        2. [Детальний другий крок приготування обіду]
        3. [Детальний третій крок приготування обіду]
        КБЖВ: [Калорії] ккал | Б: [Грами]г | Ж: [Грами]г | В: [Грами]г

        ВЕЧЕРЯ
        [Апетитна назва страви без слова Вечеря і без емодзі]
        Продукти:
        - [Назва] — [Кількість]г
        Приготування:
        1. [Детальний перший крок приготування вечері]
        2. [Детальний другий крок приготування вечері]
        3. [Детальний третій крок приготування вечері]
        КБЖВ: [Калорії] ккал | Б: [Грами]г | Ж: [Грами]г | В: [Грами]г
        """

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=2500  # Збільшуємо ліміт для детальних рецептів українською
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Помилка генерації раціону: {e}")
            return "Вибачте, сталася помилка при генерації раціону. Будь ласка, спробуйте пізніше."