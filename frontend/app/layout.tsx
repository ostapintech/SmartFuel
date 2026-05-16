import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { PostHogProvider } from './providers';

// Налаштування шрифтів
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Метадані сайту
export const metadata: Metadata = {
  title: "SmartFuel",
  description: "Персоналізований підбір раціону за групою крові",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk" // Змінив на українську мову для SEO та коректного відображення в браузері
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-black">
        {/* PostHog завжди обгортає все, щоб бачити поведінку навіть неавторизованих */}
        <PostHogProvider>
          {/* AuthProvider всередині керує сесією користувача */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}