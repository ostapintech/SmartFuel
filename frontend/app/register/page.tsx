"use client";
import { useState } from "react";
import { authService } from "../../services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    height: 170,
    weight: 70,
    age: 25,
    gender: "male",
    user_type: "Звичайна людина",
    goal: "утримання ваги",
    blood_type: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ПЕРЕТВОРЮЄМО ПЛОСКУ ФОРМУ У ВКЛАДЕНУ СТРУКТУРУ ДЛЯ FastAPI
      const payload = {
        email: formData.email,
        password: formData.password,
        anthropometry: {
          height: Number(formData.height),
          weight: Number(formData.weight),
          age: Number(formData.age),
          gender: formData.gender,
        },
        profile: {
          user_type: formData.user_type,
          goal: formData.goal,
          blood_type: formData.blood_type,
          health_conditions: [], // Можна додати поля в форму пізніше
        }
      };

      await authService.register(payload);
      alert("Реєстрація успішна! Тепер увійдіть.");
      router.push("/login");
    } catch (err: any) {
      alert("Помилка реєстрації: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">Реєстрація SmartFuel</h1>

        <input type="email" placeholder="Email" className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, email: e.target.value})} required />

        <input type="password" placeholder="Пароль" className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, password: e.target.value})} required />

        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="Зріст" className="p-2 border rounded"
            onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
          <input type="number" placeholder="Вага" className="p-2 border rounded"
            onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
          <input type="number" placeholder="Вік" className="p-2 border rounded"
            onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
        </div>

        <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, blood_type: e.target.value})}>
          <option value="1">I (0) група крові</option>
          <option value="2">II (A) група крові</option>
          <option value="3">III (B) група крові</option>
          <option value="4">IV (AB) група крові</option>
        </select>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700">
          Створити акаунт
        </button>

        <p className="text-center text-sm">
          Вже є акаунт? <Link href="/login" className="text-blue-500">Увійти</Link>
        </p>
      </form>
    </div>
  );
}