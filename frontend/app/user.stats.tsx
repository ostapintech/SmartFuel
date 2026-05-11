"use client";
import { useState } from 'react';

export default function UserStats() {
  // Параметри тіла
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(180);
  const [age, setAge] = useState<number>(20);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // Темп життя (Коефіцієнти активності)
  const [activity, setActivity] = useState<number>(1.2);

  const activities = [
    { label: 'Сидячий', val: 1.2, desc: 'Мало руху' },
    { label: 'Помірний', val: 1.55, desc: 'Тренування 3-5 разів' },
    { label: 'Активний', val: 1.9, desc: 'Важкі навантаження' },
  ];

  // Розрахунок калорій
  const bmr = gender === 'male' 
    ? 10 * weight + 6.25 * height - 5 * age + 5 
    : 10 * weight + 6.25 * height - 5 * age - 161;
  
  const totalCalories = Math.round(bmr * activity);

  return (
    <div className="mt-12 space-y-10 text-black text-left pb-20">
      
      {/* 1. Секція: Дані користувача */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Твої параметри</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[ 
            { label: 'Вага', val: weight, set: setWeight, unit: 'kg' },
            { label: 'Ріст', val: height, set: setHeight, unit: 'cm' },
            { label: 'Вік', val: age, set: setAge, unit: 'y.o.' }
          ].map((item) => (
            <div key={item.label} className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <p className="text-gray-400 text-[10px] font-bold uppercase">{item.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <input 
                  type="number" 
                  value={item.val} 
                  onChange={(e) => item.set(Number(e.target.value))}
                  className="text-4xl font-black w-full outline-none bg-transparent"
                />
                <span className="font-bold text-gray-300">{item.unit}</span>
              </div>
            </div>
          ))}

          {/* Перемикач статі */}
          <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl">
              <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${gender === 'male' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>ЧОЛ</button>
              <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${gender === 'female' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>ЖІН</button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Секція: Темп життя */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Темп життя</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activities.map((act) => (
            <button
              key={act.label}
              onClick={() => setActivity(act.val)}
              className={`p-6 rounded-4xl border-2 text-left transition-all ${
                activity === act.val ? 'border-black bg-black text-white shadow-2xl' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'
              }`}
            >
              <p className="font-black text-xl">{act.label}</p>
              <p className={`text-xs mt-1 ${activity === act.val ? 'text-gray-400' : 'text-gray-300'}`}>{act.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Bento: Результат ШІ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black p-10 rounded-[3rem] text-white flex flex-col justify-between min-h-[300px] relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest uppercase mb-6">
              AI Analysis Ready
            </div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Денна ціль калорій</h3>
            <p className="text-[120px] leading-none font-black tracking-tighter tabular-nums my-4">
              {totalCalories.toLocaleString()}
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-type-2 w-2/3 shadow-[0_0_20px_rgba(46,213,115,0.8)]"></div>
            </div>
            <p className="text-xs font-bold text-type-2 uppercase tracking-tighter">Optimal Fueling</p>
          </div>

          {/* Декоративний елемент на фоні */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-type-2/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col justify-between shadow-sm">
          <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Твій статус</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-50 pb-4">
              <span className="text-gray-400 text-sm">Група крові</span>
              <span className="font-black text-2xl text-type-1">II (A)</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-50 pb-4">
              <span className="text-gray-400 text-sm">Метаболізм</span>
              <span className="font-black text-2xl text-type-2">Active</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed mt-4">
              ШІ проаналізував ваші дані. Раціон буде оптимізовано для покращення травлення та енергії.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Секція: План харчування */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-4xl font-black tracking-tight">Персональний раціон</h2>
          <button className="px-8 py-4 bg-type-2 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-type-2/20">
            Сформувати через ШІ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Картка-заглушка для ШІ раціону */}
          <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm group cursor-pointer hover:shadow-2xl transition-all">
            <div className="aspect-square bg-gray-50 rounded-4xl flex items-center justify-center mb-6 overflow-hidden relative">
               <span className="text-gray-200 font-black text-6xl group-hover:scale-110 transition-transform">?</span>
               <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Сніданок
               </div>
            </div>
            <div className="px-4 pb-4 text-left">
              <h4 className="font-black text-xl">Очікування ШІ...</h4>
              <p className="text-gray-400 text-sm mt-1">Оберіть параметри та натисніть кнопку вище</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}