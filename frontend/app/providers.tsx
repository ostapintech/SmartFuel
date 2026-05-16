"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    // ТЕСТОВИЙ ЛОГ: перевіримо, чи взагалі Next.js бачить ключі
    console.log("PostHog ініціалізація...", { keyExists: !!key, host });

    if (typeof window !== "undefined" && key) {
      posthog.init(key, {
        api_host: host || "https://eu.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true, // Автоматичний трекінг сторінок
        capture_pageleave: true, // Виправляє варнінг $pageleave з твого скріншоту
        autocapture: true,
        loaded: (ph) => {
          console.log("🔥 PostHog успішно підключився до сервера!");
        }
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}