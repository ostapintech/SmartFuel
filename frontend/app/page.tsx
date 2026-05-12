"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import UserStats from './user.stats';

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();
  
  // Стан для обраної групи
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // ПЕРЕВІРКА АВТОРИЗАЦІЇ
  useEffect(() => {
    // Якщо токена немає, відправляємо користувача на сторінку входу
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const types = [
    { label: 'I (0)', color: 'bg-type-1', id: '1' },
    { label: 'II (A)', color: 'bg-type-2', id: '2' },
    { label: 'III (B)', color: 'bg-type-3', id: '3' },
    { label: 'IV (AB)', color: 'bg-type-4', id: '4' },
  ];

  // Якщо токена ще немає (йде перевірка), нічого не рендеримо, щоб не миготів інтерфейс
  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen p-8 md:p-24 bg-gray-50 transition-colors duration-500 text-black">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-black mb-4 tracking-tighter">
            Smart <span className="text-red-600">Fuel</span>
          </h1>
          
          {/* Твій виправлений компонент статистики */}
          <UserStats totalCalories={2136} />

          <p className="text-xl text-gray-500 font-medium mt-8">
            {selectedType ? `Твоя група: ${selectedType}` : "Обери свою групу крові"}
          </p>
        </header>

        {/* Якщо група не обрана — показуємо сітку */}
        {!selectedType ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {types.map((type) => (
              <button
                key={type.label}
                onClick={() => setSelectedType(type.label)}
                className={`${type.color} h-40 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl hover:scale-[1.02] transition-all active:scale-95 bg-blue-500`}
              >
                {type.label}
              </button>
            ))}
          </div>
        ) : (
          /* Якщо група обрана — показуємо інтерфейс пошуку */
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Введи назву продукту..." 
                className="w-full p-6 rounded-3xl bg-white shadow-xl text-2xl outline-none focus:ring-4 focus:ring-blue-200 transition-all text-black"
              />
              <button 
                onClick={() => setSelectedType(null)}
                className="mt-4 text-gray-400 hover:text-black transition-colors"
              >
                ← Змінити групу крові
              </button>
            </div>

            {/* Результат */}
            <div className="p-12 rounded-[3rem] bg-white border-2 border-dashed border-gray-200 text-center">
              <p className="text-gray-400 text-lg">Тут з&apos;явиться вердикт для твого харчування</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}