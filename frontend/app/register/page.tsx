"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'; // Додав для редиректу
import { authService } from "../../services/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Додав ім'я, зазвичай воно є в UserCreate
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Тут ми викликаємо саме REGISTER
      const data = await authService.register({ email, password, fullName });
      
      if (data) {
        alert("Реєстрація успішна! Тепер увійдіть.");
        router.push('/login'); // Після реєстрації кидаємо на логін
      }
    } catch (err) {
      console.error(err);
      alert("Помилка реєстрації. Можливо, такий email вже зайнятий.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-200"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Реєстрація у SmartFuel</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Повне ім&apos;я</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="Іван Іванов"
            required
          />
        </div>

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
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Зареєструватися
        </button>

        <p className="mt-4 text-center text-gray-600">
          Вже маєте акаунт? <a href="/login" className="text-blue-600 hover:underline">Увійти</a>
        </p>
      </form>
    </div>
  );
}