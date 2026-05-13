"use client";
import { useState } from "react";
import { authService } from "../../services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
  
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

  const showNotify = (msg: string, type: 'error' | 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
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
          health_conditions: [],
        }
      };

      await authService.register(payload);
      showNotify("Реєстрація успішна!", "success");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      showNotify(err.message || "Помилка при реєстрації", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f3f4f6]">
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[110] px-10 py-5 rounded-[2rem] shadow-2xl border-l-[12px] animate-in slide-in-from-top duration-500 min-w-[350px] ${
          notification.type === 'success' ? 'bg-green-600 border-green-900' : 'bg-red-600 border-red-900'
        } text-white font-black italic uppercase text-sm tracking-widest flex items-center gap-4`}>
          <span className="text-2xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          {notification.msg}
        </div>
      )}

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-gray-900">
            Smart <span className="text-red-600 underline decoration-8">Fuel</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 mt-4 italic">Створення нового облікового запису</p>
        </div>

        <div className="bg-gray-900 rounded-[4rem] p-10 md:p-14 shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-500" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase ml-6 italic tracking-widest">Email</label>
                <input 
                  type="email" 
                  placeholder="example@mail.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-5 text-white outline-none focus:ring-4 ring-red-600/20 focus:border-red-600 transition-all font-bold italic"
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase ml-6 italic tracking-widest">Пароль</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-5 text-white outline-none focus:ring-4 ring-red-600/20 focus:border-red-600 transition-all font-bold italic"
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <p className="text-[10px] font-black text-red-600 uppercase mb-6 italic tracking-[0.3em] text-center">Особисті параметри</p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <label className="block text-white/40 text-[9px] font-black uppercase italic tracking-tighter">Зріст (см)</label>
                  <input 
                    type="number" 
                    defaultValue="170"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-center font-black italic outline-none focus:border-red-600"
                    onChange={e => setFormData({...formData, height: Number(e.target.value)})} 
                  />
                </div>
                <div className="text-center space-y-2">
                  <label className="block text-white/40 text-[9px] font-black uppercase italic tracking-tighter">Вага (кг)</label>
                  <input 
                    type="number" 
                    defaultValue="70"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-center font-black italic outline-none focus:border-red-600"
                    onChange={e => setFormData({...formData, weight: Number(e.target.value)})} 
                  />
                </div>
                <div className="text-center space-y-2">
                  <label className="block text-white/40 text-[9px] font-black uppercase italic tracking-tighter">Вік</label>
                  <input 
                    type="number" 
                    defaultValue="25"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-center font-black italic outline-none focus:border-red-600"
                    onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase ml-6 italic tracking-widest">Група крові</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white outline-none focus:ring-4 ring-blue-600/20 focus:border-blue-600 transition-all font-bold italic appearance-none"
                onChange={e => setFormData({...formData, blood_type: e.target.value})}
              >
                <option value="1" className="bg-gray-900 text-white">I (0) ГРУПА КРОВІ</option>
                <option value="2" className="bg-gray-900 text-white">II (A) ГРУПА КРОВІ</option>
                <option value="3" className="bg-gray-900 text-white">III (B) ГРУПА КРОВІ</option>
                <option value="4" className="bg-gray-900 text-white">IV (AB) ГРУПА КРОВІ</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-7 bg-red-600 hover:bg-red-500 text-white rounded-[2.5rem] font-black uppercase italic tracking-tighter text-3xl transition-all shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Реєстрація..." : "Зареєструватися"}
            </button>

            <p className="text-center text-gray-500 font-black text-[10px] uppercase italic tracking-[0.2em]">
              Вже є акаунт? <Link href="/login" className="text-white hover:text-red-600 transition-colors underline ml-2">Увійти</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}