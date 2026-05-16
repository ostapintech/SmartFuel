const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

interface UserData {
  [key: string]: string | number | boolean;
}

export const authService = {
  // 1. Реєстрація (приймає JSON)
 register: async (userData: any) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Помилка реєстрації");
    }
    return response.json();
  },

  // 2. Логін (ВАЖЛИВО: відправляє Form Data, як того хоче твій Python код)
  login: async (email: string, password: string) => {
    // FastAPI OAuth2 очікує дані у форматі x-www-form-urlencoded
    const details: any = {
      'username': email,
      'password': password,
      'grant_type': 'password',
    };

    const formBody = Object.keys(details)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
      .join('&');

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody,
    });

    if (!response.ok) {
      throw new Error("Невірний логін або пароль");
    }

    return response.json();
  }
};