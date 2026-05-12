const API_URL = "http://192.168.1.114:8000/api/v1";

interface UserData {
  [key: string]: string | number | boolean;
}

export const authService = {
  // 1. Реєстрація (приймає JSON)
  register: async (userData: UserData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // 2. Логін (ВАЖЛИВО: відправляє Form Data, як того хоче твій Python код)
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append("username", email); // FastAPI OAuth2 очікує 'username'
    formData.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      body: formData, // Тут НЕ потрібен JSON.stringify і headers
    });

    if (!response.ok) {
      throw new Error("Невірний логін або пароль");
    }

    const data = await response.json();
    
    // Зберігаємо токен у браузері
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }
    
    return data;
  }
};