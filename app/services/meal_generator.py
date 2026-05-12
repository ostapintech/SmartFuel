from openai import OpenAI
from app.core.config import settings

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
        Ти — професійний дієтолог-нутріціолог. Твоє завдання — скласти план харчування на один день (Сніданок, Обід, Вечеря та Перекус).

        УМОВИ:
        1. Мова відповіді: ТІЛЬКИ УКРАЇНСЬКА.
        2. Дозволені продукти: {products_str}.
        3. Цільова калорійність: приблизно {target_calories} ккал.

        СПЕЦІАЛЬНІ ВИМОГИ (Група крові {blood_type}):
        {blood_type_logic}

        ФОРМАТ ВІДПОВІДІ:
        - Назва кожної страви.
        - Перелік інгредієнтів.
        - Короткий покроковий рецепт приготування.
        - Розрахунок БЖВ (білки, жири, вуглеводи) та калорій для кожного прийому їжі.

        Пиши професійно, зрозуміло та з акцентом на екологічність продуктів.
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