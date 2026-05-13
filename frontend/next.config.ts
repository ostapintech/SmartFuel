import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Тепер це пишеться просто тут */
  allowedDevOrigins: ["172.20.10.3", '192.168.1.114', 'localhost:3000', '127.0.0.1:8000'],
  
  /* Інші параметри, якщо є */
  experimental: {
    // тут порожньо або інші опції
  },
};

export default nextConfig;