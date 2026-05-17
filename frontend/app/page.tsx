"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

// --- ДАНІ ТА КОНФІГУРАЦІЯ ---
const bloodDietData: Record<string, { tip: string, b: string, j: string, v: string, kcal: number }> = {
  'I (0)': { tip: "Високобілкова дієта. Твоєму тілу потрібне «паливо» з м'яса та риби. Уникай глютену.", b: "150г", j: "70г", v: "100г", kcal: 2200 },
  'II (A)': { tip: "Рослинне харчування. Овочі та крупи допоможуть залишатися бадьорим у дорозі.", b: "90г", j: "60г", v: "250г", kcal: 1900 },
  'III (B)': { tip: "Збалансоване харчування. Ти можеш їсти майже все, але обережно з куркою та гречкою.", b: "110г", j: "80г", v: "180г", kcal: 2100 },
  'IV (AB)': { tip: "Змішаний тип. Морепродукти, молочка та зелень — твій ідеальний вибір.", b: "100г", j: "65г", v: "200г", kcal: 2000 }
};

const activityLevels = [
  { id: 'sedentary', label: 'Сидячий', desc: 'Тільки кермо', factor: 1.2, icon: '🚗' },
  { id: 'moderate', label: 'Помірний', desc: 'Зарядка/Ходьба', factor: 1.5, icon: '🏃' },
  { id: 'active', label: 'Активний', desc: 'Фізична робота', factor: 1.8, icon: '🏋️' },
];

const goalLevels = [
  { id: 'lose', label: 'Схуднення', factor: 0.85, icon: '📉' },
  { id: 'maintain', label: 'Підтримка', factor: 1.0, icon: '⚖️' },
  { id: 'gain', label: 'Набір маси', factor: 1.15, icon: '📈' },
];

const WelcomeOverlay = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 animate-out fade-out duration-1000 delay-[2000ms]">
      <div className="relative">
        <h2 className="text-white text-7xl md:text-9xl font-black italic uppercase tracking-tighter animate-bounce text-center">
          Smart <span className="text-red-600">Fuel</span>
        </h2>
        <div className="absolute -bottom-4 left-0 w-full h-2 bg-red-600 animate-stretch" />
      </div>
      <p className="mt-8 text-white/40 font-black uppercase tracking-[0.5em] animate-pulse">Завантаження інтелекту...</p>
    </div>
  );
};

const Background3D = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f3f4f6]">
    <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-red-500/20 rounded-full blur-[140px] animate-pulse duration-[10s]" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[120px] animate-bounce duration-[15s]" />
    <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[100px] animate-pulse duration-[8s]" />
    <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-600/40 rounded-full blur-sm animate-ping" />
    <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-blue-600/30 rounded-full blur-sm animate-pulse delay-700" />
    <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
  </div>
);

export default function Home() {
  const { token, isLoading, logout } = useAuth();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(activityLevels[0]);
  const [selectedGoal, setSelectedGoal] = useState(goalLevels[1]);
  const [notification, setNotification] = useState<{ msg: string, type: 'info' | 'error' | 'success' } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [swapQuery, setSwapQuery] = useState('');
  const [swapResult, setSwapResult] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthYear, setBirthYear] = useState('1995');

  // Історія раціонів
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryPlan, setSelectedHistoryPlan] = useState<any>(null);

  // Функція історії раціонів
 const fetchMealHistory = useCallback(async () => {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/meals/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setMealHistory(data.history);
    }
  } catch (e) {
    console.error("Не вдалося завантажити історію", e);
  }
}, [token]);

  const showNotification = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
if (profileRes.ok) {
  const data = await profileRes.json();
  setUserData(data);

  const prof = data.profile;
  const anthro = data.anthropometry;

  if (prof) {
    // Якщо дані оновлювалися, беремо з profile. Якщо юзер новий — з anthropometry
    setWeight(prof.weight?.toString() || anthro?.weight?.toString() || '70');
    setHeight(prof.height?.toString() || anthro?.height?.toString() || '170');

    // Пріоритетно читаємо birth_year з профілю
    if (prof.birth_year) {
      setBirthYear(prof.birth_year.toString());
    } else if (anthro?.birth_year) {
      setBirthYear(anthro.birth_year.toString());
    } else if (anthro?.age) {
      const calculatedYear = new Date().getFullYear() - Number(anthro.age);
      setBirthYear(calculatedYear.toString());
    }

    if (prof.blood_type) setSelectedType(prof.blood_type);

    const savedGoal = goalLevels.find(g => g.id === prof.goal);
    if (savedGoal) setSelectedGoal(savedGoal);
  }
}
const historyRes = await fetch(`${API_BASE_URL}/meals/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.history && historyData.history.length > 0) {
            setMealPlan(historyData.history[0].meal_plan_text);
          }
        }
      } catch (error) {
        console.error("Помилка синхронізації", error);
      }
    };
  if (token) {
    fetchInitialData();
    fetchMealHistory(); // Тепер це повністю безпечно для React
  }
}, [token, fetchMealHistory]);

  useEffect(() => {
    if (!isLoading && !token) router.replace('/login');
  }, [token, isLoading, router]);

  const dynamicKcal = (() => {
    const w = Number(weight);
    const h = Number(height);
    const age = new Date().getFullYear() - Number(birthYear);
    if (!w || !h || !age || age < 0) return selectedType ? Math.round(bloodDietData[selectedType]?.kcal * selectedGoal.factor) : 0;

    const bmr = (10 * w) + (6.25 * h) - (5 * age) + 5;
    const bloodMod = selectedType === 'II (A)' ? 0.95 : selectedType === 'I (0)' ? 1.05 : 1.0;

    return Math.round(bmr * selectedActivity.factor * bloodMod * selectedGoal.factor);
  })();


const handleUpdateProfile = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // 🔥 Передаємо плоский об'єкт БЕЗ age, але З обов'язаковим birth_year
      body: JSON.stringify({
        weight: Number(weight),
        height: Number(height),
        birth_year: Number(birthYear), // 🎯 Ось воно, те саме поле!
        gender: userData?.anthropometry?.gender || "male",
        user_type: userData?.profile?.user_type || "Звичайна людина",
        blood_type: selectedType,
        goal: selectedGoal.id
      })
    });

    if (res.ok) {
      setIsEditing(false);
      showNotification("Дані збережено в хмарі", "success");

      // Оновлюємо локальний стейт
      setUserData((prev: any) => ({
        ...prev,
        profile: {
          ...prev?.profile,
          weight: Number(weight),
          height: Number(height),
          birth_year: Number(birthYear),
          blood_type: selectedType,
          goal: selectedGoal.id
        }
      }));
    } else {
      const errorData = await res.json();
      console.log("Деталі помилки 422:", errorData);
      showNotification("Помилка збереження", "error");
    }
  } catch (e) {
    showNotification("Помилка мережі", "error");
  }
};

  const parseMealPlan = (text: string) => {
    const meals = { breakfast: '', lunch: '', dinner: '' };
    const bMatch = text.match(/Сніданок:([\s\S]*?)(?=Обід:|$)/i);
    const lMatch = text.match(/Обід:([\s\S]*?)(?=Вечеря:|$)/i);
    const dMatch = text.match(/Вечеря:([\s\S]*?)$/i);

    if (bMatch) meals.breakfast = bMatch[1].trim();
    if (lMatch) meals.lunch = lMatch[1].trim();
    if (dMatch) meals.dinner = dMatch[1].trim();

    if (!meals.breakfast && !meals.lunch && !meals.dinner) {
      const parts = text.split('\n\n').filter(p => p.length > 10);
      return { breakfast: parts[0] || '', lunch: parts[1] || '', dinner: parts[2] || text };
    }
    return meals;
  };

  const toggleBloodType = (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
    }
  };

  const handleSmartSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setScannedProduct(null);
    setSearchResults([]);

    const isBarcode = /^\d+$/.test(query);

    try {
      if (isBarcode) {
        const response = await fetch(`${API_BASE_URL}/meals/product/${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.product) {
          setScannedProduct(data.product);
          showNotification("Продукт знайдено за штрих-кодом!", "success");
        } else {
          showNotification(data.detail || "Продукт не знайдено", "error");
        }
      } else {
        if (query.length < 3) {
          showNotification("Для пошуку за назвою введіть мінімум 3 символи", "info");
          setIsSearching(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/meals/search?query=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.results && data.results.length > 0) {
          setSearchResults(data.results);
          showNotification(`Знайдено продуктів: ${data.results.length}`, "success");
        } else {
          showNotification(data.message || "Нічого не знайдено", "error");
        }
      }
    } catch (e) {
      showNotification("Помилка зв'язку з сервером", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeneratePlan = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch(`${API_BASE_URL}/meals/generate-and-save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_calories: dynamicKcal
      })
    });

    const result = await response.json();
    if (response.ok) {
      setMealPlan(result.meal_plan);

      // 🔥 ОСЬ ЦЕЙ РЯДОК РЯТУЄ СИТУАЦІЮ!
      // Відразу смикаємо бекенд, щоб забрати свіжу історію разом із новим планом
      await fetchMealHistory();

      showNotification("Раціон оновлено під твої поточні калорії!", "success");
    }
  } catch (e) {
    showNotification("Помилка генерації", "error");
  } finally {
    setIsGenerating(false);
  }
};

// Викликаємо історію щоразу, коли користувач генерує новий план, щоб вона оновлювалася
  const handleSmartSwapAction = () => {
    if (!swapQuery) return;
    const q = swapQuery.toLowerCase();
    const type = selectedType || 'I (0)';
    let result = "";

    if (q.match(/бургер|фрі|піца|хот|дог|шаурма|мак|кфс/)) {
      const tips: any = {
        'I (0)': "🍔 Фастфуд — це глютенова пастка. Заміни його на соковитий стейк з салатом. Тобі потрібен чистий білок!",
        'II (A)': "🍔 Твій шлунок не любить важке м'ясо в тісті. Обирай овочевий рол, фалафель або вегетаріанський бургер з сочевиці.",
        'III (B)': "🍔 Уникай курки в паніровці. Краще візьми кебаб з баранини або кролика з великою порцією овочів.",
        'IV (AB)': "🍔 Твій варіант — рибний бургер або сендвіч з тунцем та зеленню. Уникай червоного м'яса в булках."
      };
      result = tips[type] || tips['I (0)'];
    }
    else if (q.match(/цукор|цукерки|торт|шоколад|печиво|мед/)) {
      const tips: any = {
        'I (0)': "🍩 Цукор гальмує твій метаболізм. Заміни на чорнослив або горіхи.",
        'II (A)': "🍩 Солодощі забивають судини. Твій десерт — свіжі ягоди або ананас.",
        'III (B)': "🍩 Тобі підходить темний шоколад або запечене яблуко з корицею.",
        'IV (AB)': "🍩 Обирай фрукти з низькою кислотністю: ківі або горіхи кеш'ю."
      };
      result = tips[type] || tips['I (0)'];
    }
    else {
      result = `💡 Для групи ${type}: замість "${swapQuery}" краще спожити продукт з високим вмістом білка (для 0) або клітковини (для А).`;
    }
    setSwapResult(result);
  };

  const getAdvice = (type: string) => {
    const list: any = {
      'fatigue': "🥱 Втома: Тобі потрібна вода та магній. Уникай цукру.",
      'hunger': "🍔 Голод: Обирай складні вуглеводи (каші) та білок для тривалої ситості.",
      'stress': "🧘 Стрес: Випий м'ятного чаю або зроби 10-хвилинну зупинку без гаджетів."
    };
    showNotification(list[type], "info");
  };

  if (isLoading || !token) return <div className="h-screen bg-gray-900" />;
  const parsedMeals = mealPlan ? parseMealPlan(mealPlan) : null;

  return (
    <main className="min-h-screen p-4 md:p-10 pb-20 relative overflow-x-hidden">
      {showWelcome && <WelcomeOverlay onComplete={() => setShowWelcome(false)} />}
      <Background3D />

      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-5 rounded-2xl shadow-2xl border-l-8 transform transition-all animate-in slide-in-from-right duration-300 min-w-[320px] ${
          notification.type === 'success' ? 'bg-green-600 border-green-900 text-white' : 
          notification.type === 'error' ? 'bg-red-600 border-red-900 text-white' : 
          'bg-gray-900 border-black text-white'
        }`}>
          <p className="font-black text-xs uppercase tracking-widest">{notification.msg}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto backdrop-blur-[1px]">
        <div className="flex justify-between items-center mb-10">
          <div className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic shadow-2xl border border-white/10">
            System Online <span className="text-red-600 animate-pulse ml-1">●</span>
          </div>
          <button onClick={logout} className="text-red-600 font-black text-sm hover:scale-110 transition-transform uppercase italic">Вийти</button>
        </div>

        <header className="mb-16 text-center">
          <h1 className="text-8xl md:text-[10rem] font-black mb-4 tracking-tighter italic leading-none drop-shadow-2xl">
            Smart <span className="text-red-600 underline decoration-8">Fuel</span>
          </h1>

          <div className="flex flex-col items-center gap-4">
            {isEditing ? (
              <div className="flex flex-wrap justify-center gap-3 bg-white/40 p-4 rounded-[2rem] border border-white shadow-2xl animate-in zoom-in">
                <input type="number" placeholder="Рік" value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-20 p-3 rounded-xl font-black bg-white outline-none border-2 border-transparent focus:border-red-600" />
                <input type="number" placeholder="Вага" value={weight} onChange={e => setWeight(e.target.value)} className="w-20 p-3 rounded-xl font-black bg-white outline-none border-2 border-transparent focus:border-red-600" />
                <input type="number" placeholder="Зріст" value={height} onChange={e => setHeight(e.target.value)} className="w-20 p-3 rounded-xl font-black bg-white outline-none border-2 border-transparent focus:border-red-600" />
                <button onClick={handleUpdateProfile} className="bg-red-600 text-white px-6 rounded-xl font-black uppercase text-[10px]">Зберегти</button>
                <button onClick={() => setIsEditing(false)} className="bg-black text-white px-4 rounded-xl font-black uppercase text-[10px]">✕</button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 text-gray-500 font-black uppercase italic text-[11px] tracking-widest bg-white/30 px-6 py-2 rounded-full border border-white/50 backdrop-blur-sm">
                <span>Користувач: <span className="text-black">{userData?.email}</span></span>
                <span className="text-red-600">|</span>
                <span>Зріст: {height}см</span>
                <span className="text-red-600">|</span>
                <span>Вага: {weight}кг</span>
                <button onClick={() => setIsEditing(true)} className="text-black hover:text-red-600 transition-colors ml-2">⚙️ Редагувати</button>
              </div>
            )}
          </div>
        </header>

        <section className="mb-14">
          <h3 className="text-sm font-black text-gray-400 uppercase italic mb-6 text-center tracking-widest">Виберіть групу крові:</h3>
          <div className="grid grid-cols-4 gap-4 px-2">
            {Object.keys(bloodDietData).map(type => (
              <button
                key={type}
                onClick={() => toggleBloodType(type)}
                className={`py-6 rounded-[2rem] text-xs md:text-sm font-black transition-all border-4 shadow-xl ${
                  selectedType === type 
                  ? 'bg-red-600 border-red-600 text-white scale-110 shadow-red-600/30' 
                  : 'bg-white/80 backdrop-blur-md border-transparent text-gray-400 hover:text-black hover:scale-105'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h3 className="text-2xl font-black mb-8 uppercase italic flex items-center tracking-tighter">
             <span className="text-red-600 mr-3 text-3xl">🎯</span> Ваша мета:
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {goalLevels.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`p-8 rounded-[3rem] transition-all border-4 shadow-xl ${
                  selectedGoal.id === goal.id 
                  ? 'bg-black text-white border-red-600 scale-105 shadow-red-500/20' 
                  : 'bg-white/70 backdrop-blur-xl text-gray-400 border-transparent hover:border-gray-300'
                }`}
              >
                <span className="text-5xl block mb-3">{goal.icon}</span>
                <p className="font-black text-sm uppercase">{goal.label}</p>
              </button>
            ))}
          </div>
        </section>

        {selectedType && (
          <div className="bg-gray-900 rounded-[4rem] p-10 md:p-16 text-white shadow-[0_50px_100px_rgba(0,0,0,0.4)] mb-16 border border-white/5 relative animate-in zoom-in duration-500">
            <button onClick={() => setSelectedType(null)} className="absolute top-10 right-10 text-white/10 hover:text-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
              <div className="text-center md:text-left">
                <h2 className="text-7xl font-black text-red-600 mb-4 italic tracking-tighter uppercase">Група {selectedType}</h2>
                <p className="text-gray-400 italic text-2xl max-w-md leading-snug">"{bloodDietData[selectedType]?.tip || 'Завантаження поради...'}"</p>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-transparent p-10 rounded-[3.5rem] border border-white/10 text-center min-w-[220px] shadow-inner">
                <p className="text-7xl font-black leading-none mb-2 text-white italic">{dynamicKcal}</p>
                <p className="text-red-600 font-black text-[11px] uppercase tracking-[0.3em]">Норма Ккал</p>
              </div>
            </div>

            {parsedMeals && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col">
                  <div className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 italic opacity-70">🌅 Сніданок</div>
                  <div className="text-gray-200 text-xl italic leading-relaxed font-light">{parsedMeals.breakfast || "Генерується..."}</div>
                </div>
                <div className="bg-white/5 rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col">
                  <div className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 italic opacity-70">☀️ Обід</div>
                  <div className="text-gray-200 text-xl italic leading-relaxed font-light">{parsedMeals.lunch || "Генерується..."}</div>
                </div>
                <div className="bg-white/5 rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col">
                  <div className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 italic opacity-70">🌙 Вечеря</div>
                  <div className="text-gray-200 text-xl italic leading-relaxed font-light">{parsedMeals.dinner || "Генерується..."}</div>
                </div>
              </div>
            )}

            <button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full py-9 bg-red-600 rounded-[3rem] font-black text-4xl transition-all hover:bg-red-500 shadow-[0_20px_50px_rgba(220,38,38,0.3)] active:scale-95 uppercase italic tracking-tighter">
              {isGenerating ? 'Синхронізація...' : 'Оновити раціон'}
            </button>
                    <button
          type="button"
          onClick={() => { fetchMealHistory(); setIsHistoryOpen(true); }}
          className="w-full mt-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-bold uppercase italic tracking-wider text-sm transition-all border border-white/10"
        >
          📜 Переглянути історію раціонів ({mealHistory.length})
        </button>
          </div>
        )}

        <section className="mb-14">
          <h3 className="text-2xl font-black mb-8 uppercase italic flex items-center tracking-tighter">
             <span className="text-red-600 mr-3 text-3xl">⚡️</span> Режим сьогодні:
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {activityLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedActivity(level)}
                className={`p-8 rounded-[3rem] transition-all border-4 shadow-xl ${
                  selectedActivity.id === level.id 
                  ? 'bg-black text-white border-red-600 scale-105 shadow-red-500/20' 
                  : 'bg-white/70 backdrop-blur-xl text-gray-400 border-transparent hover:border-gray-300'
                }`}
              >
                <span className="text-5xl block mb-3">{level.icon}</span>
                <p className="font-black text-sm uppercase mb-1">{level.label}</p>
                <p className="text-[10px] opacity-60 font-bold leading-tight uppercase tracking-tighter">{level.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-3 gap-4 mb-16">
          <button onClick={() => getAdvice('fatigue')} className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-lg font-black text-[11px] uppercase border-b-8 border-orange-400 hover:-translate-y-2 transition-all active:translate-y-0">🥱 Втома</button>
          <button onClick={() => getAdvice('hunger')} className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-lg font-black text-[11px] uppercase border-b-8 border-green-500 hover:-translate-y-2 transition-all active:translate-y-0">🍔 Голод</button>
          <button onClick={() => getAdvice('stress')} className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-lg font-black text-[11px] uppercase border-b-8 border-purple-500 hover:-translate-y-2 transition-all active:translate-y-0">🧘 Стрес</button>
        </div>
          {isHistoryOpen && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
    <div className="bg-gray-900 border border-white/10 w-full max-w-4xl h-[80vh] rounded-[3rem] p-8 md:p-12 flex flex-col relative overflow-hidden">

      {/* Кнопка закриття */}
      <button
        onClick={() => { setIsHistoryOpen(false); setSelectedHistoryPlan(null); }}
        className="absolute top-6 right-6 text-white/50 hover:text-white font-black text-xl bg-white/5 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
      >
        ✕
      </button>

      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6">
        Історія <span className="text-red-600 underline">раціонів</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Ліва частина: Список дат і калорій */}
        <div className="md:col-span-1 overflow-y-auto pr-2 space-y-3 border-r border-white/5">
        {mealHistory.length === 0 ? (
  <p className="text-white/30 text-xs uppercase italic p-4 text-center">Історія порожня</p>
) : (
  // 🔥 Додаємо індекс (index) як другий аргумент у map
  mealHistory.map((plan, index) => (
    <div
      // 🔥 Використовуємо plan.id, а якщо він undefined — беремо index
      key={plan.id || index}
      onClick={() => setSelectedHistoryPlan(plan)}
      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
        selectedHistoryPlan?.id === plan.id 
          ? 'bg-red-600 border-red-500 text-white' 
          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
      }`}
    >
      <p className="text-[10px] font-black opacity-50 uppercase">
        {plan.created_at ? new Date(plan.created_at).toLocaleDateString('uk-UA', {
          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        }) : "Колись"}
      </p>
      <p className="text-xl font-black italic mt-1">{plan.target_calories} ккал</p>
      <p className="text-[9px] uppercase font-bold tracking-tight opacity-70 mt-1 truncate">
        {plan.allowed_products && plan.allowed_products.length > 0
          ? plan.allowed_products.join(', ')
          : 'Стандартний набір'}
      </p>
    </div>
  ))
)}
        </div>

        {/* Права частина: Перегляд обраного рецепту */}
        <div className="md:col-span-2 overflow-y-auto bg-black/40 border border-white/5 rounded-3xl p-6 text-white text-left">
          {selectedHistoryPlan ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-2xl font-black italic text-red-500 uppercase">План на {selectedHistoryPlan.target_calories} ккал</h3>
                <button
                  onClick={() => {
                    // Хак: відновлюємо цей план на головний екран!
                    setMealPlan(selectedHistoryPlan.meal_plan_text);
                    setIsHistoryOpen(false);
                    showNotification("Старий раціон завантажено на головний екран", "success");
                  }}
                  className="px-4 py-2 bg-white text-black font-black text-[10px] rounded-xl uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
                >
                  Застосувати
                </button>
              </div>
              {/* Рендеримо текст рецепту з ШІ */}
              <p className="whitespace-pre-line text-sm font-medium text-gray-300 leading-relaxed">
                {selectedHistoryPlan.meal_plan_text}
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/30 text-xs font-black uppercase italic tracking-widest text-center">
              👉 Обери раціон зі списку ліворуч для перегляду
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
        {/* СЕКЦІЯ AI ПОШУКУ ЇЖІ */}
        <section className="bg-white/90 backdrop-blur-2xl p-10 rounded-[4rem] shadow-2xl mb-16 border border-white relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black flex items-center uppercase italic tracking-tighter">
                <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-xs italic font-black shadow-lg">AI</span>
                Розумний пошук їжі
            </h3>
            {(searchQuery || scannedProduct || searchResults.length > 0) && (
                <button onClick={() => { setSearchQuery(''); setScannedProduct(null); setSearchResults([]); }} className="text-gray-400 hover:text-red-600 font-black text-xs uppercase italic transition-colors">✕ Скинути</button>
            )}
          </div>

          {/* Поле вводу */}
          <div className="flex gap-4 mb-10">
            <input
              type="text"
              placeholder="Введіть штрих-код або назву продукту..."
              className="flex-1 p-6 bg-gray-100/50 rounded-[2rem] font-black border-4 border-transparent focus:border-blue-600 outline-none transition-all italic text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
            <button onClick={handleSmartSearch} className="px-10 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95">
              {isSearching ? '...' : 'Пошук'}
            </button>
          </div>

          {/* Список результатів пошуку за назвою */}
          {searchResults.length > 0 && !scannedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 animate-in fade-in duration-500">
              {searchResults.map((prod: any, idx: number) => (
                <div
                  key={prod.id || idx}
                  onClick={() => setScannedProduct(prod)}
                  className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50/50 rounded-3xl border border-gray-100 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {prod.image ? (
                      <img src={prod.image} className="max-w-full max-h-full object-contain" alt="" />
                    ) : (
                      <span className="text-[9px] text-gray-400 font-black uppercase">No pic</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-black text-gray-800 text-sm truncate uppercase italic tracking-tight">
                      {prod.product_name}
                    </h5>
                    <p className="text-xs text-gray-400 font-bold uppercase truncate">
                      {prod.brands}
                    </p>
                  </div>
                  <div className="ml-auto bg-blue-100 text-blue-800 font-black text-[10px] px-3 py-1 rounded-xl">
                    {Math.round(prod.nutriments?.energy_kcal_100g || 0)} ккал
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Картка обраного / відсканованого продукту */}
          {scannedProduct && (() => {
            const pName = scannedProduct.product_name || scannedProduct.product_name_uk || scannedProduct.product_name_en || "Невідомий продукт";
            const brand = scannedProduct.brands || scannedProduct.brand || "Бренд не вказано";
            const imgUrl = scannedProduct.image || scannedProduct.image_front_url || scannedProduct.image_front_small_url || scannedProduct.image_url;

            const nutrs = scannedProduct.nutriments || {};

            const kcal = Math.round(
              nutrs.energy_kcal_100g ||
              nutrs["energy-kcal_100g"] ||
              nutrs.energy_kcal ||
              nutrs.energy_value || 0
            );

            const proteins = nutrs.proteins_100g || nutrs.proteins || nutrs.proteins_value || 0;
            const fats = nutrs.fat_100g || nutrs.fat || nutrs.fat_value || 0;
            const carbs = nutrs.carbohydrates_100g || nutrs.carbohydrates || nutrs.carbohydrates_value || 0;

            return (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {searchResults.length > 0 && (
                  <button
                    onClick={() => setScannedProduct(null)}
                    className="mb-4 text-blue-600 font-black text-xs uppercase italic hover:underline flex items-center gap-1"
                  >
                    ← Назад до результатів пошуку
                  </button>
                )}

                <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-gradient-to-br from-blue-50 to-white rounded-[3.5rem] border border-blue-100 mb-10 shadow-inner">
                  <div className="relative w-44 h-44 flex-shrink-0 bg-white rounded-[2.5rem] p-4 shadow-2xl border border-blue-50 overflow-hidden flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} className="max-w-full max-h-full object-contain" alt={pName} />
                    ) : (
                      <div className="text-gray-400 font-black italic text-xs text-center">Фото відсутнє</div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase italic">Smart Fuel</div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-4xl font-black text-blue-900 mb-2 italic tracking-tighter uppercase">
                      {pName}
                    </h4>
                    <p className="text-blue-600 font-black mb-6 uppercase text-xs tracking-widest opacity-60">
                      {brand}
                    </p>
                    <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm italic shadow-xl">
                        {kcal === 0 ? 'ℹ️ НЕМАЄ ДАНИХ ПРО ККАЛ' : kcal < 350 ? '✅ ПІДХОДИТЬ' : '⚠️ КАЛОРІЙНО'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    ['Енергія', kcal, 'ккал', 'bg-red-50'],
                    ['Білки', proteins, 'г', 'bg-blue-50'],
                    ['Жири', fats, 'г', 'bg-orange-50'],
                    ['Вуглеводи', carbs, 'г', 'bg-green-50'],
                  ].map(([label, val, unit, color]) => (
                    <div key={label as string} className={`${color} p-6 rounded-[2.5rem] border border-white shadow-sm flex flex-col items-center justify-center`}>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{label}</p>
                      <p className="text-3xl font-black italic text-gray-800">
                        {typeof val === 'number' ? val.toFixed(1).replace('.0', '') : val}
                        <span className="text-xs ml-1 uppercase">{unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* СЕКЦІЯ РОЗУМНОЇ ЗАМІНИ */}
        <section className="bg-black p-10 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] mb-16 border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black flex items-center uppercase italic tracking-tighter text-white">
                <span className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-xs italic font-black shadow-lg">AI</span>
                Розумна заміна
            </h3>
            {(swapQuery || swapResult) && (
                <button onClick={() => { setSwapQuery(''); setSwapResult(null); }} className="text-gray-500 hover:text-red-600 font-black text-xs uppercase italic transition-colors">✕</button>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Що замінити?"
              className="flex-1 p-6 bg-white/5 rounded-[2rem] font-black outline-none focus:ring-4 ring-red-600/50 text-white italic text-lg border border-white/10"
              value={swapQuery}
              onChange={(e) => setSwapQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSmartSwapAction()}
            />
            <button onClick={handleSmartSwapAction} className="px-10 bg-white text-black rounded-[2rem] font-black uppercase text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-xl">Замінити</button>
          </div>

          {swapResult && (
            <div className="p-8 bg-red-600/10 border-l-8 border-red-600 rounded-[2.5rem] font-bold italic text-gray-200 animate-in slide-in-from-left-6 text-lg leading-relaxed backdrop-blur-md">
              {swapResult}
            </div>
          )}
        </section>
      </div>

    </main>
  );
}