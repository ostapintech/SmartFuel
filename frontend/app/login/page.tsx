"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "../../services/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const data = await authService.login(email, password);
    console.log("Відповідь сервера:", data); // Подивись у консоль браузера (F12)

    if (data && data.access_token) {
      login(data.access_token);
    } else {
      console.error("Токен не знайдено в об'єкті:", data);
      alert("Сервер не повернув токен.");
    }
  } catch (err: any) {
    console.error("Помилка при виконанні authService.login:", err);
    alert(err.message || "Помилка входу.");
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">SmartFuel</h1>
        <div className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg text-black" required
          />
          <input
            type="password" placeholder="Пароль" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-black" required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            Увійти
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Немає акаунту? <Link href="/register" className="text-blue-500 underline">Зареєструватися</Link>
        </p>
      </form>
    </div>
  );
}