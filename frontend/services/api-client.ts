const API_BASE_URL = "http://192.168.1.114:8000/api/v1"; // Використовуй IP, щоб працювало з усіх пристроїв

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Помилка API: ${response.status}`);
  }

  return response.json();
};