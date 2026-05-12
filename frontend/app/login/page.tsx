"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "../../services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Викликаємо функцію з вашого authService.ts
      const data = await authService.login(email, password);
      
      if (data.access_token) {
        login(data.access_token); // Оновлюємо глобальний стан
        alert("Успішний вхід!");
      }
    } catch (err) {
      console.error(err);
      alert("Невірний логін або пароль");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-200"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Вхід у SmartFuel</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Увійти
        </button>
      </form>
    </div>
  );
}