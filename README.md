# NutriAI — AI Nutrition Coach 🥗🤖

**NutriAI** is a production-ready, AI-first nutrition tracker that works as a
responsive website **and** an installable mobile app (PWA) on iPhone & Android.
Log meals just by _talking_ to the AI — in Arabic (including **Saudi & Gulf
dialects**) or English — by **photo**, or by **voice**. It estimates calories &
macros instantly, shows a confidence score, and coaches you like a real
nutritionist.

> «غديت مضبي نص دجاجة مع رز» → logged ✅ · 440 kcal · 26g protein · **96% confidence**

<p align="center">Chat • Photo • Voice • Barcode → instant, effortless logging</p>

---

## ✨ Highlights

- **AI is the main experience.** A ChatGPT-style coach parses natural language
  and logs meals automatically — no forms, no interrogation.
- **Understands Saudi dialect.** `غديت`, `تعشيت`, `سويت بالبيت`, `من البيك`,
  Arabic-Indic numerals (`٣ بيضات`), `نص/ربع`, grams, cups, scoops…
- **Works with zero config.** With no API keys it runs in a full **demo mode**:
  a deterministic offline Saudi/Arabic meal parser + local-first storage.
  Add keys to unlock GPT-4o vision, Whisper voice, and cloud sync.
- **Premium, Apple-style UI.** Glassmorphism, dark/light themes, RTL/LTR,
  Framer Motion animations, Chart.js graphs — fast and accessible.

## 🧠 Features

| Area | What you get |
|------|--------------|
| **AI Chat** | Natural conversation, memory, context awareness, confidence scores, editable estimates, auto meal categorisation (breakfast/lunch/dinner/snack). |
| **Photo AI** | Upload a plate → detects multiple foods, estimates weight, calories, protein, carbs, fat (GPT-4o vision). |
| **Voice AI** | Speak naturally → on-device Web Speech API, with Whisper fallback → auto-logged. |
| **Barcode** | Scan any product (native `BarcodeDetector` + manual entry) → nutrition via Open Food Facts. |
| **Dashboard** | Calories, protein, carbs, fat, fiber, sugar, sodium, water, steps, burned. |
| **Goals** | Calories, protein, carbs, fat, water, steps, target weight — with auto-calculation (Mifflin-St Jeor TDEE). |
| **Weight** | Beautiful trend graphs, progress photos, body measurements, BMI scale. |
| **Exercise** | Gym, walking, running, cycling, swimming → MET-based calories burned. |
| **AI Coach** | Remembers meals, flags low protein / high calories / low water, motivates. |
| **Food DB** | Saudi & Gulf dishes, fast food, restaurants (AlBaik, KFC, McDonald's, Herfy, Shawarmer, Buffalo, Subway, Pizza Hut, Domino's, Hardee's, Texas Chicken, Burger King), search, favourites, recents. |
| **Analytics** | Daily/weekly/monthly/yearly charts, calories, protein, weight change, streaks, achievements. |
| **Fasting** | 16:8 / 18:6 / 20:4 / OMAD live countdown timer & eating window. |
| **Notifications** | Meal, water, workout, weight & fasting reminders. |
| **PWA** | Installable on iOS/Android, offline support, service worker, app icons, shortcuts. |
| **Auth & Sync** | Supabase auth (Google, Apple, Email) + local-first cloud snapshot sync. |

## 🛠️ Tech Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion ·
Chart.js · Zustand (local-first store) · Supabase (Auth + PostgreSQL + Storage) ·
OpenAI (GPT-4o / GPT-4o-mini / Whisper) · Open Food Facts (barcode) · PWA.

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. (Optional) configure keys — the app runs fully without them in demo mode
cp .env.example .env.local
#   NEXT_PUBLIC_SUPABASE_URL / ANON_KEY   → auth + cloud sync
#   OPENAI_API_KEY                        → real vision, voice & smarter parsing

# 3. Run
npm run dev        # http://localhost:3000

# 4. Production
npm run build && npm start
```

### Database

Create a free Supabase project and run [`supabase/schema.sql`](supabase/schema.sql)
in the SQL editor. It provisions all tables, **Row-Level Security** (every user
only sees their own data), an auto-profile trigger on sign-up, storage buckets
for meal/progress photos, and a `user_state` snapshot table for local-first
multi-device sync.

### Environment modes

| Keys present | Behaviour |
|---|---|
| none | **Demo mode** — offline Saudi/Arabic parser, local storage, sample estimates for photos. Everything is usable. |
| OpenAI only | Real GPT-4o vision + Whisper voice + smarter chat parsing. |
| Supabase only | Google/Apple/Email auth + encrypted cloud sync across devices. |
| both | Full production experience. |

## 📱 Install as an app

Open the site on your phone → **Add to Home Screen** (iOS Safari: Share → Add to
Home Screen; Android Chrome: install prompt / menu). Launches full-screen,
offline-capable, with its own icon.

## 🏗️ Project structure

```
src/
  app/
    (app)/            dashboard, chat, foods, weight, exercise, fasting, analytics, settings
    (auth)/           login
    api/              ai/chat, ai/image, ai/voice, barcode, state  (route handlers)
    callback/         OAuth code exchange
  components/         UI primitives, charts, dashboard, chat, foods, barcode scanner
  hooks/              useAiLog, useVoice, usePwaInstall, useCloudSync
  lib/                ai, meal-parser (offline Saudi NLP), food-db, nutrition, analytics, i18n, supabase
  store/              Zustand local-first store (persisted)
supabase/schema.sql   full Postgres schema + RLS
public/               manifest.json, sw.js, icons
```

## 🔒 Security & privacy

- Supabase Auth (Google, Apple, Email) with per-row RLS policies.
- Service-role key is server-only and never shipped to the client.
- In demo mode, all data stays on-device (localStorage) — nothing leaves the browser.

## 📄 License

MIT — see [LICENSE](LICENSE).
