import openfoodfacts
import asyncio
from typing import Dict, Any, Optional


class OpenFoodService:
    def __init__(self):
        # Ініціалізація клієнта з обов'язковим User-Agent
        self.api = openfoodfacts.API(
            user_agent="SmartfuelApp/1.0 (University Project)"
        )

    async def get_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        """Отримує інформацію про продукт за штрих-кодом."""
        try:
            # Викликаємо метод через api.product.get() та загортаємо у фоновий потік,
            # щоб не блокувати асинхронний цикл FastAPI
            product_info = await asyncio.to_thread(self.api.product.get, barcode)

            if not product_info:
                return None

            return product_info
        except Exception as e:
            print(f"Помилка отримання продукту: {e}")
            return None

    async def search_products(self, query: str) -> list:
        """Шукає продукти за назвою."""
        try:
            results = await asyncio.to_thread(
                self.api.product.text_search, query
            )
            return results.get("products", [])
        except Exception as e:
            print(f"Помилка пошуку продуктів: {e}")
            return []