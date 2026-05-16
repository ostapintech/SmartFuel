import openfoodfacts
import asyncio
from typing import Dict, Any, Optional, List


class OpenFoodService:
    def __init__(self):
        # Ініціалізація клієнта з обов'язковим User-Agent
        self.api = openfoodfacts.API(
            user_agent="SmartfuelApp/1.0 (University Project)"
        )

    def _clean_product_data(self, p: Dict[str, Any]) -> Dict[str, Any]:
        """
        Перетворює величезний JSON від OFF у компактний формат SmartFuel.
        """
        # Аналіз інгредієнтів для пальмової олії
        tags = p.get("ingredients_analysis_tags", [])
        is_palm_oil_free = "en:palm-oil-free" in tags

        # Обробка пакування
        packaging_text = p.get("packaging", "Інформація відсутня")

        return {
            "product_name": p.get("product_name", "Невідомий товар"),
            "brand": p.get("brands", "Невідомий бренд"),
            "image": p.get("image_front_url"),
            "eco_data": {
                "ecoscore_grade": p.get("ecoscore_grade", "unknown").upper(),
                "labels": p.get("labels_tags", []),
                "is_palm_oil_free": is_palm_oil_free,
                "origins": p.get("origins_tags", [])
            },
            "packaging": {
                "material": "Пластик/PET" if "pet" in packaging_text.lower() else "Змішане",
                "recyclable": "en:recyclable" in p.get("packaging_tags", []),
                "info": packaging_text
            },
            "quality": {
                "additives_count": len(p.get("additives_tags", [])),
                "nova_group": p.get("nova_group")
            },
            "nutriments": p.get("nutriments", {})  # Калорії знадобляться для розрахунку раціону
        }

    async def get_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        try:
            # Отримуємо сирі дані
            raw_data = await asyncio.to_thread(self.api.product.get, barcode)

            # ДЕБАГ-ЛОГІКА:
            # Перевіряємо, де саме лежать дані про продукт
            product_json = None

            if isinstance(raw_data, dict):
                # Варіант 1: Дані лежать у ключі 'product'
                if "product" in raw_data:
                    product_json = raw_data["product"]
                # Варіант 2: Об'єкт raw_data і є самим продуктом
                elif "product_name" in raw_data:
                    product_json = raw_data

            if not product_json:
                print(f"Продукт {barcode} не знайдено в базі OFF")
                return None

            # Повертаємо чистий JSON через наш маппер
            return self._clean_product_data(product_json)

        except Exception as e:
            print(f"Помилка в OpenFoodService: {e}")
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
            # Викликаємо пошук у окремому потоці
            raw_results = await asyncio.to_thread(
                self.api.product.text_search, query
            )

            products = raw_results.get("products", [])
            sanitized_products = []

            for p in products:
                # Витягуємо нутрієнти безпечно
                nutrs = p.get("nutriments", {})

                # Шукаємо калорії у всіх можливих ключах OFF
                kcal = (
                        nutrs.get("energy-kcal_100g") or
                        nutrs.get("energy_kcal_100g") or
                        nutrs.get("energy_value") or 0
                )

                # ФІЛЬТР: якщо калорій 0 (або поле порожнє), ігноруємо цей продукт
                if kcal <= 0:
                    continue

                # Додаткова перевірка: якщо назва зовсім відсутня, теж пропускаємо
                product_name = p.get("product_name_uk") or p.get("product_name") or p.get("product_name_en")
                if not product_name:
                    continue

                # Якщо продукт пройшов перевірку, додаємо його до списку
                sanitized_products.append({
                    "id": p.get("_id") or p.get("code"),
                    "product_name": product_name,
                    "brands": p.get("brands") or "Бренд не вказано",
                    "image": p.get("image_front_url") or p.get("image_front_small_url") or p.get("image_url"),
                    "nutriments": {
                        "energy_kcal_100g": kcal,
                        "proteins_100g": nutrs.get("proteins_100g") or nutrs.get("proteins") or 0,
                        "fat_100g": nutrs.get("fat_100g") or nutrs.get("fat") or 0,
                        "carbohydrates_100g": nutrs.get("carbohydrates_100g") or nutrs.get("carbohydrates") or 0
                    }
                })

            return sanitized_products

        except Exception as e:
            print(f"Помилка пошуку продуктів: {e}")
            return []

