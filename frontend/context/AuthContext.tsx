"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import posthog from "posthog-js";

interface AuthContextType {
  token: string | null;
  user: any | null;       // Додаємо користувача в контекст, щоб головна сторінка бачила його групу крові
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // Стан для зберігання профілю користувача
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Функція для завантаження даних профілю з бекенду
  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData); // Зберігаємо профіль у глобальний стан

        // 🔥 ПОВ'ЯЗУЄМО ЮЗЕРА З POSTHOG
        // Передаємо унікальний ідентифікатор (наприклад, email) та його групу крові як властивість
        if (userData && userData.email) {
          posthog.identify(userData.email, {
            email: userData.email,
            blood_type: userData.profile?.blood_type || "not_set",
          });
        }
      } else {
        // Якщо токен невалідний або протух — розлогінюємо користувача
        logout();
      }
    } catch (error) {
      console.error("Помилка завантаження профілю з /me:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Перевірка токена при першому завантаженні сторінки
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken); // Якщо токен є, одразу йдемо за профілем
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // Після встановлення токена підтягуємо дані профілю
    fetchUserProfile(newToken);

    setTimeout(() => router.push('/'), 100);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null); // Очищаємо стан користувача

    // 🔥 СКИДАЄМО СЕСІЮ В POSTHOG
    // Наступний користувач на цьому ПК згенерує вже чисту нову аналітику
    posthog.reset();

    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};