# 🎬 Anime Streaming Website

Modern anime streaming website built using **Vite.js** and powered by the **Sankavollerei Anime REST API**.

This project allows users to browse anime, search titles, view anime details, and stream episodes from multiple sources such as Otakudesu, Samehadaku, Kusonime, and more.

---

# ✨ Features

- 🔍 Anime Search
- 📺 Episode Streaming
- 🎞 Anime Detail Pages
- 🆕 Latest Anime Updates
- 🔥 Popular Anime
- 📅 Anime Schedule
- 🎭 Browse by Genre
- 📱 Responsive Design
- ⚡ Fast build using Vite

---

# 🛠 Tech Stack

- Vite.js
- JavaScript / React
- Fetch API / Axios
- TailwindCSS (optional)
- Sankavollerei Anime API

---

# 🌐 API Source

Base API URL:
```
https://www.sankavollerei.com/anime/
```
API Rate Limit:
```py
50 Request/minute
```

Make sure to implement caching and avoid excessive API calls.

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/anime-website.git
```
Go to the project folder
```bash
cd anime-website
```
Install dependencies
```bash
npm install
```
Run DEV Server
```bash
npm run dev
```
Run Production
```bash
npm run build
```
---
# Project Structure
```bash
anime-web
│
├── src
│   ├── components
│   │   ├── Navbar.jsx
│   │   ├── AnimeCard.jsx
│   │   └── Player.jsx
│   │
│   ├── pages
│   │   ├── Home.jsx
│   │   ├── AnimeDetail.jsx
│   │   ├── Episode.jsx
│   │   └── Search.jsx
│   │
│   ├── api
│   │   └── animeApi.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── index.html
```
---
# 🔌 Example API Request
- Get latest anime
```js
fetch("https://www.sankavollerei.com/anime/home")
  .then(res => res.json())
  .then(data => console.log(data))
```
- Search anime
```js
fetch("https://www.sankavollerei.com/anime/search/naruto")
```
- Get anime detail
```js
fetch("https://www.sankavollerei.com/anime/anime/naruto")
```
- Get episode streaming
```js
fetch("https://www.sankavollerei.com/anime/episode/naruto-episode-1")
```
---
# ⚠️ API Best Practices

Because the API has a rate limit of 50 requests per minute, it is recommended to:

- Implement API caching
- Use debounce on search input
- Avoid repeated API calls
- Use pagination where available
- Load data lazily when possible
---
# 🚀 Future Improvements

- [ ]⭐ Anime Watchlist

- [ ]👤 User Accounts

- [ ]💬 Comment System

- [ ]🎬 Auto Next Episode

- [ ]📱 Progressive Web App (PWA)

- [ ]🔔 Anime Notifications
---
# 📜 License

This project is created for educational purposes only.
All anime content and streaming sources belong to their respective owners.

---
# Made By Me
