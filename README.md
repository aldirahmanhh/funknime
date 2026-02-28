# funknime

Modern **Anime + Comic** web app built with **Next.js (App Router) + TypeScript + Tailwind**.

Upstream APIs (Sanka):
- Anime: https://www.sankavollerei.com/anime/
- Comic: https://www.sankavollerei.com/comic

## Features
- Modern zumnime-style UI (dark/light)
- Home sections (anime + comic) via cached server proxies
- Anime:
  - Home + schedule
  - Browse A–Z (unlimited)
  - Search
  - Detail + episode player with **quality/server dropdown**
- Comic:
  - Homepage + trending/popular/latest/recommendations/random
  - Detail + long-scroll reader
- Auth (NextAuth) + progress saving:
  - Save last watched episode
  - Save last read chapter

## Key design
- Browser never calls upstream directly.
- All upstream calls go through Next.js Route Handlers (`/api/anime/*`, `/api/comic/*`) with `Cache-Control` to reduce upstream hits (rate limit safe).
- Some upstream endpoints contain ads like `/plus/` → filtered in UI.

## Setup (local)

### 1) Install
```bash
npm install
```

### 2) Env
Copy env example:
```bash
cp .env.example .env.local
```

Fill minimal:
- `NEXTAUTH_SECRET`

Optional auth providers:
- `GITHUB_ID` / `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

Database (required for save progress):
- `DATABASE_URL`
- `DIRECT_URL` (recommended; can be same as DATABASE_URL if you only have one URL)

### 3) Prisma
```bash
npx prisma generate
npx prisma migrate dev
```

## Important: Rate limit
Upstream rate limit: **70 requests/minute**.

This project mitigates it by:
- CDN caching headers in `/api/*` routes
- avoiding direct browser → upstream calls

Don’t spam the upstream.

### 4) Run
```bash
npm run dev
```

## Deploy (Vercel)
1. Push repo to GitHub
2. Import to Vercel
3. Set env vars in Vercel Project Settings:
   - `DATABASE_URL` (Neon Postgres free tier recommended)
   - `NEXTAUTH_URL` (your vercel url)
   - `NEXTAUTH_SECRET`
   - OAuth provider secrets (optional)
4. Run migrations (one-time) locally against production DB:
```bash
DATABASE_URL="..." npx prisma migrate deploy
```

