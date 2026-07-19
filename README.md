# FitTrack

> Fitness tracking web app — log workouts, track progress, set goals, and get weekly email summaries.

**Live:** https://fittrack-frontend-three.vercel.app

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| HTTP | Axios |
| Hosting | Vercel |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Sign up |
| `/verify-otp` | Email OTP verification |
| `/onboarding` | First-time setup |
| `/dashboard` | Overview & stats |
| `/workout` | Start / manage workout |
| `/workout/log` | Log sets |
| `/workout/start` | Start a session |
| `/workout/history` | Past workouts |
| `/workout/:id` | Single workout detail |
| `/exercises` | Exercise library |
| `/templates` | Workout templates |
| `/templates/create` | Create template |
| `/templates/:id/edit` | Edit template |
| `/progress` | Progress charts |
| `/progress/monthly/:year/:month` | Monthly breakdown |
| `/profile` | User profile |

---

## Local Setup

```bash
git clone <repo-url>
cd fittrack_frontend
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

App starts at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `https://fittrack-backend-ahwh.onrender.com`) |

---

## CI/CD

Push to `main` → GitHub Actions runs:
1. `npm ci` — install deps
2. `npm run lint` — ESLint check
3. `npm run build` — TypeScript + build check
4. On success → Vercel auto-deploys via GitHub integration

Pipeline config: `.github/workflows/ci.yml`

**Required GitHub Secret:** `NEXT_PUBLIC_API_URL`
