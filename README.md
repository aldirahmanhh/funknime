# 🎬 MrFunk — Anime Streaming Platform

<div align="center">

**MrFunk** is a modern anime & donghua streaming platform built with **React + Vite**, powered by the [Sankavollerei Anime REST API](https://www.sankavollerei.com/anime/).

Stream anime sub Indo with a combined catalog from **Otakudesu** & **Samehadaku** — all in one place.

[🌐 Live Demo](https://mrfunk.vercel.app) · [☕ Support via Trakteer](https://trakteer.id/aldirahmanhh)

</div>

---

## ✨ Features

- 🔍 **Unified Search** — Search across Otakudesu & Samehadaku simultaneously
- 📺 **Multi-Provider Streaming** — Auto-fallback between providers for best availability
- 🐉 **Donghua Support** — Full donghua catalog with genres, A-Z list, and streaming
- 📅 **Schedule** — Daily anime airing schedule
- 🎭 **Genre Browser** — Browse anime by genre from multiple providers
- 🔤 **A-Z List** — Alphabetical anime & donghua browsing
- 🕐 **Watch History** — Resume from last watched minute/second with progress bar
- ☕ **Trakteer Integration** — Donation system with top donor leaderboard
- 🎨 **Dark Neobrutalism UI** — Purple-themed modern design with smooth animations
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- ⚡ **PWA Ready** — Installable as a Progressive Web App
- 🛡️ **Anti-Ads** — Built-in ad popup blocker for streaming iframes

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI Framework |
| **Vite 8** | Build Tool |
| **React Router 7** | Client-side Routing |
| **Sankavollerei API** | Anime Data Source |
| **Trakteer API** | Donation Integration |
| **Vercel** | Hosting & Deployment |

---

## 🌐 API Credits

This project uses the **Sankavollerei Anime REST API** as its primary data source:

```
Base URL: https://www.sankavollerei.com/anime/
Rate Limit: 50 requests/minute
```

**Huge thanks to [Sanka Vollerei](https://www.sankavollerei.com)** for providing this free anime API! 🙏

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/aldirahmanhh/Funknime.git
cd Funknime

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
MrFunk/
├── src/
│   ├── components/     # React components (Home, Watch, AnimeCard, etc.)
│   ├── contexts/       # ThemeContext
│   ├── hooks/          # useDebounce, useInfiniteScroll
│   ├── services/       # API service layer
│   ├── utils/          # Watch history utilities
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── public/             # Static assets, PWA manifest
└── index.html          # HTML template with SEO meta tags
```

---

## ☕ Support

If you enjoy using MrFunk, consider supporting the project:

- **[Trakteer](https://trakteer.id/aldirahmanhh)** — Buy me a coffee! ☕
- **Star this repo** ⭐ — It helps a lot!

---

## 📜 Disclaimer

This project is created for **educational purposes only**. All anime content and streaming sources belong to their respective owners. We do not host any video content.

---

## 📄 License

MIT License — feel free to fork and modify.

---

<div align="center">

Made with 💜 by [aldirahmanhh](https://github.com/aldirahmanhh)

**API powered by [Sankavollerei](https://www.sankavollerei.com)** 🙏

</div>
