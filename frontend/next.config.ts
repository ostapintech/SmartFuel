import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Тепер це пишеться просто тут */
  allowedDevOrigins: ["172.20.10.3", '192.168.1.114', 'localhost:3000', '10.10.10.107', '127.0.0.1:8000'],
  
  /* Інші параметри, якщо є */
  experimental: {
    // тут порожньо або інші опції
  },
};

export default nextConfig;

// frontend/services/config.ts

// Якщо в системі є хмарна адреса (на Vercel), беремо її. Якщо ні — працюємо локально.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";