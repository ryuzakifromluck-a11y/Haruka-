# Haruka's SAT Journey

A private, single-student SAT preparation platform built for Haruka's goal of **1400+ in 20 weeks**.

- **Dashboard** — greeting, 1400+ target, editable exam countdown, overall and weekly progress, today's schedule with checkboxes, Math and R&W progress, recent test results, 7-day activity chart, focus suggestions drawn from her own data.
- **Study Plan** — the full 20-week curriculum (orientation and diagnostic in Week 1, test phase in Weeks 16–20). Every day lists topic, objective, time, practice assignment, and a completion checkbox, and she can add personal tasks.
- **Study Timer** — focus/break timer that survives refreshes. Only focus time is logged, plus manual session logging.
- **SAT Math** — the 4 official domains, 16 topics, each with an overview, formulas, worked examples, easy/medium/hard exercises, SAT-style questions with explanations, and mastery tracking. There is also a Desmos Tips section.
- **Reading & Writing** — the 4 official domains with 11 skill lessons (strategies, traps, practice), a grammar handbook, and **vocabulary flashcards** that show the English word, definition, Uzbek translation, an example, and review status.
- **Test Center** — official College Board resources and third-party providers in clearly separated sections, with filters. Every test opens on the provider's own site.
- **Error Notebook** — log mistakes with filters (subject, topic, difficulty, unreviewed) and a **Retry Mistakes** mode. Wrong answers in in-app practice can be saved with one click.
- **Progress** — focused hours, lessons, exercises, weekly consistency, domain mastery, test history with validated manual score entry, and a score chart that keeps official and unofficial results apart.
- **Settings** — exam date, plan start date, daily goal, light/dark/system theme, English/Uzbek interface, notifications, backup export/restore, and progress reset.

All in-app questions are **original, AI-generated, and labelled unofficial**. No College Board or third-party questions are copied. The app never estimates or invents scores.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Lucide icons · Recharts · Supabase (Auth + Postgres with Row Level Security).

## Privacy model

| Layer | What it does |
|---|---|
| No registration | Magic-link sign-in with `shouldCreateUser: false`. Accounts exist only if you invite them in Supabase. |
| Server allowlist | `ALLOWED_EMAILS` (server-only env var) is checked in middleware on every request, in the sign-in action, and in the auth callback. Anyone else is signed out. |
| Database RLS | `study_state` rows are readable/writable only by their owner **and** only if the email is in the `allowed_emails` table. |
| No indexing | `robots.txt` disallows everything, plus `noindex` meta tags and an `X-Robots-Tag` header on every response. |
| Fail closed | In production without Supabase credentials, every page redirects to a setup notice instead of serving an open site. |

> **The site is only private once Supabase is configured as below.** In local mode the app shows a "not private" banner and stores progress in the browser only.

## Setup

### 1. Run locally

```bash
npm install
cp .env.example .env.local   # fill in values, or leave Supabase empty for local mode
npm run dev                  # http://localhost:3000
```

Without Supabase values, development runs in **local mode**, where progress is saved in `localStorage`.

### 2. Create the Supabase project

1. Create a project at <https://supabase.com>.
2. **SQL Editor → New query**: paste and run [`supabase/schema.sql`](supabase/schema.sql).
3. Add Haruka's email to the database allowlist:
   ```sql
   insert into public.allowed_emails (email) values ('haruka@example.com');
   ```
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up". Keep the Email provider enabled.
5. **Authentication → Users → Invite user**: invite Haruka's email. She accepts the invite once.
6. **Authentication → URL Configuration**:
   - Site URL: your deployed URL (for example `https://harukas-sat.vercel.app`)
   - Redirect URLs: add `https://<your-domain>/auth/callback` and `http://localhost:3000/auth/callback`
7. **Project Settings → API**: copy the Project URL and the `anon` public key.

### 3. Environment variables

| Variable | Where | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public (protected by RLS) | `eyJ…` |
| `ALLOWED_EMAILS` | **server only** | `haruka@example.com` |
| `NEXT_PUBLIC_SITE_URL` | optional | `https://harukas-sat.vercel.app` |

Never put the Supabase `service_role` key in this app. It isn't needed.

### 4. Deploy (Vercel)

1. Push this repository to GitHub and import it in Vercel.
2. Add the environment variables above (Production and Preview).
3. Deploy, then open the site. You should land on **/login**.
4. Enter the invited email, open the link **on the same device and browser**, and you're in.

Any Node host that runs `npm run build && npm start` also works.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build (type-checks and lints)
npm start       # serve the production build
npm run lint
```

## Project structure

```
src/
  app/(app)/        pages: dashboard, plan, timer, math, reading-writing, vocabulary, tests, errors, progress, settings
  app/login, auth/  magic-link sign-in, callback, sign-out
  components/       UI kit, app shell, charts, question card, task row
  data/             curriculum, math topics, R&W skills, vocabulary, resources
  lib/              store (local + Supabase sync), plan generator, metrics, dates, Supabase clients
  middleware.ts     session refresh + allowlist gate + noindex header
supabase/schema.sql
```

## Study pet

A small 3D companion (cat, dog, rabbit or fox) lives in the corner of every page. It is built with three.js from simple shapes (no model files) and the 3D engine is lazy-loaded after the page is ready, so it never slows the study pages down.

- **My Pet page** (`/pet`): choose the animal, coat, name and size, try its 8 moods, turn sounds on, hide it, or bring it back to the corner. All pets are available; there are no paid tiers.
- **Interactions:** drag it anywhere (on phones, press and hold first), pet it by moving the cursor back and forth over it (or rubbing with a finger), click (or press Enter) to open its AI chat. It naps when you are inactive, cheers when you finish a task or log study time, and gets excited when you come back.
- **Saved:** the chosen pet, coats, names, size, sound and last position are stored with the rest of the study data (`pet` in `study_state`), so they follow Haruka across refreshes and devices.
- Code: `src/components/pet/` (`pets.ts` personalities, `engine.ts` 3D models and animation, `PetCompanion.tsx` behaviour and gestures).

### Pet AI chat

Clicking the pet opens a floating chat window above it. The pet thinks for a moment, greets Haruka, and then answers anything she asks (SAT questions, study plans, or just a chat). Replies stream in word by word. Each animal has its own personality and voice: the cat is calm and witty, the dog is energetic and encouraging, the rabbit is shy and gentle, and the fox is clever and playful. It always replies in the site language (EN, UZ or RU).

- **Setup:** the chat uses [Groq](https://console.groq.com). Create a key at https://console.groq.com/keys and set `GROQ_API_KEY` on the server (see `.env.example`; on Vercel, add it under Project → Settings → Environment Variables and redeploy). `PET_CHAT_MODEL` is optional and defaults to `llama-3.3-70b-versatile`. Without a key the chat opens and says it is not switched on yet; it never shows made-up replies.
- **Security:** the browser only talks to `/api/pet-chat`. The key stays on the server, the route requires the signed-in, allowlisted account (or local mode where the site itself is allowed to run), and each user is rate limited (8 messages a minute, 40 per 10 minutes, 300 a day). The limiter is in memory, so on serverless hosts it is per instance.
- **Behaviour:** the conversation is kept while the chat is open or minimized, and cleared when it is closed. Escape minimizes.
- **Honesty rules:** the pet is told never to invent scores or official College Board statements, to say when it is unsure, and that it cannot see Haruka's saved data. A note under the input reminds her that AI replies can be wrong.
- Code: `src/app/api/pet-chat/route.ts`, `src/lib/pet-chat/` (personalities, rate limit), `src/components/pet/PetChat.tsx` (window).

## Notes

- Notifications are browser notifications. They work while the site is open in a tab and do not use a push server.
- Progress is cached in the browser and synced to Supabase with a short debounce. If a sync fails, the sidebar says so and data stays saved locally.
- Uzbek translations are short study glosses, not full dictionary entries.

## Languages (English, O‘zbekcha, Русский)

- Switch language from the EN/UZ/RU control in the top bar, the mobile menu, Settings, or the sign-in page. It changes instantly, is saved with your progress, and is remembered in a `haruka-lang` cookie so pages render in the right language from the first paint.
- All interface text lives in `src/i18n/messages/<area>.ts`. Each file defines English, Uzbek and Russian side by side, and TypeScript fails the build if a language is missing a key.
- The 20-week plan text is translated in `src/data/curriculum.i18n.*.ts` (looked up by the English sentence) and `src/i18n/messages/planGen.ts`.
- SAT content is intentionally **not** translated: questions, passages, answer choices, explanations, lessons, vocabulary definitions/examples, and official SAT domain/skill names stay in English, like the real test.
#   r e d e p l o y  
 