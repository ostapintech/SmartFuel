"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading || !token) return <div className="flex h-screen items-center justify-center">Завантаження...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end">
          <button onClick={logout} className="text-sm text-red-500 underline">Вийти</button>
        </div>

        <header className="mb-16 text-center">
          <h1 className="text-6xl font-black mb-4">Smart <span className="text-red-600">Fuel</span></h1>
          <p className="text-xl text-gray-500">Оберіть свою групу крові для персоналізації</p>
        </header>

        {/* Решта вашого коду з кнопками вибору групи крові */}
        <div className="grid grid-cols-2 gap-4">
           {['I (0)', 'II (A)', 'III (B)', 'IV (AB)'].map(type => (
             <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="h-32 bg-blue-500 text-white rounded-3xl text-2xl font-bold"
             >
               {type}
             </button>
           ))}
        </div>
      </div>
    </main>
  );
}