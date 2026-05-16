const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";;

// Функція для отримання токена з пам'яті браузера
const getAuthHeader = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const mealsService = {
  // 1. Генеруємо новий план (потрібна авторизація)
  generatePlan: async () => {
    const response = await fetch(`${API_URL}/generate-and-save`, {
      method: "POST",
      headers: { ...getAuthHeader() }
    });
    return response.json();
  },

  // 2. Отримуємо історію (потрібна авторизація)
  getHistory: async () => {
    const response = await fetch(`${API_URL}/history`, {
      headers: { ...getAuthHeader() }
    });
    return response.json();
  },

  // 3. Пошук продукту за назвою (публічно)
  searchFood: async (query: string) => {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    return response.json();
  },

  // 4. Сканування штрих-коду
  getByBarcode: async (barcode: string) => {
    const response = await fetch(`${API_URL}/product/${barcode}`);
    return response.json();
  }
};