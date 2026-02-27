# Anime & Comic Web (MVP)

Next.js app (App Router + TypeScript + Tailwind) that consumes **Sanka API**:
- Anime: https://www.sankavollerei.com/anime/
- Comic: https://www.sankavollerei.com/comic

## Key design
- Browser never calls upstream directly.
- All upstream calls go through Next.js Route Handlers (`/api/anime/*`, `/api/comic/*`) with CDN cache headers to reduce upstream hits (rate limit safe).

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

### 3) Prisma
```bash
npx prisma generate
npx prisma migrate dev
```

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

