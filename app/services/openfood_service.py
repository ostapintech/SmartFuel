import openfoodfacts
import asyncio
from typing import Dict, Any, Optional, List


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

    async def search_products_by_name(self, query: str, page_size: int = 10) -> List[Dict[str, Any]]:
        """
        Шукає продукти за назвою з урахуванням екологічних метрик.
        """
        try:
            # Використовуємо asyncio.to_thread для синхронного методу бібліотеки
            search_result = await asyncio.to_thread(
                self.api.product.text_search,
                query,
                page_size=page_size
            )

            products = search_result.get("products", [])
            processed_results = []

            for p in products:
                # Формуємо чистий об'єкт для фронтенду/логіки
                processed_results.append({
                    "id": p.get("_id"),
                    "name": p.get("product_name"),
                    "brand": p.get("brands"),
                    "image": p.get("image_front_url"),
                    "ecoscore": p.get("ecoscore_grade", "unknown").upper(),
                    "nutriscore": p.get("nutriscore_grade", "unknown").upper(),
                    "is_organic": "en:organic" in p.get("labels_tags", []),
                    "categories": p.get("categories", "").split(",")[:3]  # перші 3 категорії
                })

            # Сортуємо: спочатку екологічні (A, B), потім решта
            processed_results.sort(key=lambda x: x['ecoscore'] if x['ecoscore'] != "UNKNOWN" else "Z")

            return processed_results

        except Exception as e:
            print(f"Помилка під час пошуку: {e}")
            return []

