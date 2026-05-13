"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "../../services/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
  const { login } = useAuth();

  const showNotify = (msg: string, type: 'error' | 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data && data.access_token) {
        showNotify("Вхід виконано успішно!", "success");
        setTimeout(() => login(data.access_token), 800);
      } else {
        showNotify("Помилка: Токен доступу не отримано", "error");
      }
    } catch (err: any) {
      showNotify(err.message || "Невірний email або пароль", "error");
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

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <header className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-gray-900">
            Smart <span className="text-red-600 underline decoration-8">Fuel</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 mt-4 italic">Вхід в особистий кабінет</p>
        </header>

        <div className="bg-gray-900 rounded-[4rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-white/30 text-[10px] font-black uppercase tracking-[0.2em] ml-6 italic">Електронна пошта</label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white outline-none focus:ring-4 ring-red-600/20 focus:border-red-600 transition-all font-bold italic text-lg"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-white/30 text-[10px] font-black uppercase tracking-[0.2em] ml-6 italic">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white outline-none focus:ring-4 ring-red-600/20 focus:border-red-600 transition-all font-bold italic text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-7 bg-red-600 hover:bg-red-500 text-white rounded-[2.5rem] font-black uppercase italic tracking-tighter text-2xl transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Завантаження..." : "Увійти"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link href="/register" className="text-gray-500 font-black text-xs uppercase italic tracking-widest hover:text-white transition-colors">
              Ще немає акаунту? <span className="text-red-600 ml-1">Зареєструватися</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}