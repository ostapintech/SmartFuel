"use client";

import { useState, useEffect } from "react";

interface UserStatsProps {
  totalCalories?: number;
}

export default function UserStats({ totalCalories = 2136 }: UserStatsProps) {
  // 1. Використовуємо useEffect для перевірки, чи завантажився клієнт
  const [mounted, setMounted] = useState(false);

  // 2. Ефект спрацює тільки в браузері з затримкою
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 3. Поки ми на сервері, рендеримо порожній блок або заглушку, 
  // щоб не було конфлікту форматів (кома vs пробіл)
  if (!mounted) {
    return (
      <div className="relative z-10 min-h-37.5 animate-pulse bg-gray-100 rounded-xl">
        <div className="p-4">Завантаження статистики...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div>
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">
          Денна ціль калорій
        </h3>
        <p className="text-[120px] leading-none font-black tracking-tighter tabular-nums my-4">
          {totalCalories.toLocaleString()}
        </p>
      </div>
    </div>
  );
}