# Dokumentasi Provider & Endpoint Funknime

Base REST API: `https://www.sankavollerei.com/anime`  
File ini merangkum endpoint dan struktur respons utama untuk provider yang digunakan di `src/services/api.js`.

- `otakudesu`
- `donghua`
- `samehadaku`
- `kusonime`
- `anoboy`
- `oploverz`
- `stream` (Anime Indo)

> Semua contoh disederhanakan ke field yang relevan dengan UI Funknime (judul, poster, slug/id, daftar episode, dll.).

---

## 1. Otakudesu

**Base**: `https://www.sankavollerei.com/anime`  
**Prefix**: tidak ada (endpoint langsung di root)

### 1.1 Home

- **Path**: `/home`  
- **Method**: GET  
- **Deskripsi**: Halaman utama Otakudesu – daftar anime ongoing & completed.

**Struktur contoh:**

```json
{
  "status": "success",
  "creator": "Sanka Vollerei",
  "data": {
    "ongoing": {
      "href": "/ongoing-anime",
      "animeList": [
        {
          "title": "string",
          "poster": "string URL",
          "episodes": 12,
          "releaseDay": "Minggu",
          "latestReleaseDate": "15 Mar",
          "animeId": "slug-id",
          "href": "/anime/anime/<slug>"
        }
      ]
    },
    "completed": {
      "href": "/complete-anime",
      "animeList": [
        {
          "title": "string",
          "poster": "string URL",
          "episodes": 24,
          "score": "7.45",
          "lastReleaseDate": "06 Jan",
          "animeId": "slug-id",
          "href": "/anime/anime/<slug>"
        }
      ]
    }
  },
  "pagination": null
}
```

### 1.2 Schedule

- **Path**: `/schedule`  
- **Method**: GET  
- **Deskripsi**: Jadwal rilis anime per hari (Otakudesu).

```json
{
  "status": "success",
  "data": {
    "schedule": [
      {
        "day": "Senin",
        "animeList": [
          {
            "title": "string",
            "animeId": "slug-id",
            "href": "/anime/anime/<slug>"
          }
        ]
      }
    ]
  }
}
```

### 1.3 Daftar ongoing & completed

- **Ongoing list**: `/ongoing-anime?page=:page`
- **Completed list**: `/complete-anime?page=:page`

Keduanya mengembalikan:

```json
{
  "status": "success",
  "data": {
    "animeList": [
      {
        "title": "string",
        "poster": "string URL",
        "episodes": 12,
        "animeId": "slug-id",
        "href": "/anime/anime/<slug>"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "hasNext": true
  }
}
```

### 1.4 Genre & Search

- **Semua genre**: `/genre`
- **Anime per genre**: `/genre/:slug`
- **Search**: `/search/:keyword`

Semua endpoint ini mengembalikan list anime dengan bentuk mirip `animeList[]` di atas (title, poster, animeId, href).

### 1.5 Detail anime & episode

- **Detail anime**: `/anime/:slug`
- **Detail episode**: `/episode/:slug`
- **Server streaming**: `/server/:serverId`
- **Batch download**: `/batch/:slug`
- **Unlimited list (A–Z)**: `/unlimited`

Struktur penting untuk UI:

```json
// Detail anime
{
  "status": "success",
  "data": {
    "title": "string",
    "animeId": "slug-id",
    "poster": "string URL",
    "synopsis": "string",
    "genres": [{ "name": "Action", "slug": "action" }],
    "episodes": [
      {
        "episode": 1,
        "title": "string",
        "href": "/episode/<episode-slug>"
      }
    ]
  }
}

// Detail episode + server
{
  "status": "success",
  "data": {
    "title": "Episode 1",
    "anime": { "title": "string", "animeId": "slug-id" },
    "servers": [
      {
        "id": "serverId",
        "name": "string",
        "url": "https://...",
        "quality": "720p"
      }
    ]
  }
}
```

---

## 2. Donghua

**Prefix**: `/donghua`

### 2.1 Home

- **Path**: `/donghua/home/:page`
- **Method**: GET  
- **Deskripsi**: Beranda donghua – rilis terbaru.

```json
{
  "status": "success",
  "latest_release": [
    {
      "title": "string",
      "slug": "string",
      "poster": "string URL",
      "status": "Ongoing|Completed",
      "type": "Donghua",
      "current_episode": "Ep 10",
      "href": "/donghua/episode/<slug>"
    }
  ]
}
```

### 2.2 Ongoing & Completed

- **Ongoing**: `/donghua/ongoing/:page`
- **Completed**: `/donghua/completed/:page`

Keduanya mengembalikan list donghua serupa `latest_release[]`.

### 2.3 Genre, A–Z, Search

- **Semua genre**: `/donghua/genres`
- **Donghua per genre**: `/donghua/genres/:slug/:page`
- **A–Z list**: `/donghua/az-list/:letter/:page`
- **Search**: `/donghua/search/:keyword`

Struktur umum:

```json
{
  "status": "success",
  "data": {
    "animeList": [
      {
        "title": "string",
        "slug": "string",
        "poster": "string URL",
        "status": "Ongoing|Completed"
      }
    ]
  }
}
```

### 2.4 Detail & Episode

- **Detail donghua**: `/donghua/detail/:slug`
- **Episode**: `/donghua/episode/:slug`

Struktur mirip provider lain: detail + episodes + links streaming/download.

---

## 3. Samehadaku

**Prefix**: `/samehadaku`

### 3.1 Home

- **Path**: `/samehadaku/home`
- **Method**: GET  
- **Deskripsi**: Halaman utama Samehadaku: recent, movie, top 10, dll.

```json
{
  "status": "success",
  "data": {
    "recent": {
      "href": "/samehadaku/recent",
      "animeList": [
        {
          "title": "string",
          "poster": "string URL",
          "episodes": "10",
          "releasedOn": "x menit yang lalu",
          "animeId": "slug",
          "href": "/samehadaku/anime/<slug>"
        }
      ]
    },
    "movie": {
      "href": "/samehadaku/movies",
      "animeList": [ /* list movie */ ]
    },
    "top10": {
      "href": "/samehadaku/top10",
      "animeList": [ /* list top10 */ ]
    }
  }
}
```

### 3.2 List & Schedule

- **Recent**: `/samehadaku/recent`
- **Ongoing**: `/samehadaku/ongoing`
- **Completed**: `/samehadaku/completed`
- **Popular**: `/samehadaku/popular`
- **Movies**: `/samehadaku/movies`
- **List (A–Z)**: `/samehadaku/list`
- **Schedule**: `/samehadaku/schedule`

Struktur utama umumnya:

```json
{
  "status": "success",
  "data": {
    "animeList": [ /* ... */ ]
  }
}

// Schedule
{
  "status": "success",
  "data": [
    {
      "day": "Senin",
      "anime_list": [
        {
          "title": "string",
          "animeId": "slug",
          "href": "/samehadaku/anime/<slug>"
        }
      ]
    }
  ]
}
```

### 3.3 Genre & Search

- **Semua genre**: `/samehadaku/genres`
- **Anime per genre**: `/samehadaku/genres/:genreId`
- **Search**: `/samehadaku/search/:keyword`

`data.genres[]` berisi `{ title, genreId, href }`, sedangkan `data.animeList[]` untuk hasil genre/search.

### 3.4 Detail, Episode, Server, Batch

- **Detail anime**: `/samehadaku/anime/:animeId`
- **Detail episode**: `/samehadaku/episode/:episodeId`
- **Server streaming**: `/samehadaku/server/:serverId`
- **Batch list**: `/samehadaku/batch`
- **Detail batch**: `/samehadaku/batch/:batchId`

Struktur tipikal:

```json
// Detail anime
{
  "status": "success",
  "data": {
    "title": "string",
    "poster": "string URL",
    "animeId": "slug",
    "synopsis": "string",
    "genreList": [{ "title": "Action", "genreId": "action" }],
    "episodeList": [
      { "episodeId": "ep-slug", "title": "Episode 1" }
    ]
  }
}

// Detail episode
{
  "status": "success",
  "data": {
    "title": "Episode 1",
    "animeId": "slug",
    "server": {
      "qualities": [
        {
          "title": "480p",
          "serverList": [
            { "serverId": "id", "title": "Server 1", "href": "/samehadaku/server/<id>" }
          ]
        }
      ]
    }
  }
}
```

---

## 4. Kusonime

**Prefix**: `/kusonime`

### 4.1 Latest & All Anime

- **Latest**: `/kusonime/latest`
- **All anime**: `/kusonime/all-anime`

Keduanya memakai struktur utama `anime_list[]` di root:

```json
{
  "status": "success",
  "creator": "Sanka Vollerei",
  "anime_list": [
    {
      "title": "string",
      "slug": "string",
      "poster": "string URL",
      "genres": [
        { "name": "Fantasy", "slug": "fantasy" }
      ],
      "released": "3:00 pm"
    }
  ]
}
```

### 4.2 Genre, Season, Movie, Search

- **Movie**: `/kusonime/movie`
- **Semua genre**: `/kusonime/all-genres`
- **Anime per genre**: `/kusonime/genre/:slug`
- **Semua season**: `/kusonime/all-seasons`
- **Anime per season**: `/kusonime/season/:season/:year`
- **Search**: `/kusonime/search/:query`

Struktur tetap berbasis `anime_list[]` atau `genres[]` / `seasons[]` di root.

### 4.3 Detail anime

- **Detail**: `/kusonime/detail/:slug`

```json
{
  "status": "success",
  "data": {
    "title": "string",
    "slug": "string",
    "poster": "string URL",
    "genres": [{ "name": "Action", "slug": "action" }],
    "download_links": [
      { "resolution": "720p", "host": "Google Drive", "url": "https://..." }
    ]
  }
}
```

---

## 5. Anoboy

**Prefix**: `/anoboy`

> Catatan: beberapa endpoint (`/anoboy/home`) saat ini merespons sukses HTTP tapi `data` berisi pesan error (403 ke sumber). Tetap dicatat untuk kelengkapan.

### 5.1 Home & List

- **Home**: `/anoboy/home`
- **List**: `/anoboy/list`
- **A–Z list**: `/anoboy/az-list`

Struktur normal (saat sumber OK) akan mirip list anime dengan field `title`, `slug`, `poster`. Saat ini untuk `home` bisa berisi:

```json
{
  "status": "success",
  "message": "Error fetching Anoboy data from https://anoboy.be",
  "error": "Request failed with status code 403"
}
```

### 5.2 Genre, Search, Detail

- **Semua genre**: `/anoboy/genres`
- **Anime per genre**: `/anoboy/genre/:slug`
- **Search**: `/anoboy/search/:keyword`
- **Detail anime**: `/anoboy/anime/:slug`
- **Detail episode**: `/anoboy/episode/:slug`

Semua mengembalikan field dasar: `title`, `slug`, `poster`, dll., di dalam `data` / `animeList` / `anime_list` tergantung endpoint.

---

## 6. Oploverz

**Prefix**: `/oploverz`

### 6.1 Home & List

- **Home**: `/oploverz/home`
- **List**: `/oploverz/list`

```json
{
  "status": "success",
  "source": "Oploverz",
  "anime_list": [
    {
      "title": "One Piece Episode 1155 Subtitle Indonesia",
      "slug": "one-piece-episode-1155-subtitle-indonesia",
      "poster": "string URL",
      "type": "TV",
      "episode": "Ep 1155",
      "status": null
    }
  ],
  "pagination": {
    "hasNext": true,
    "hasPrev": false,
    "currentPage": 1
  }
}
```

### 6.2 Schedule, Ongoing, Completed

- **Schedule**: `/oploverz/schedule`
- **Ongoing**: `/oploverz/ongoing`
- **Completed**: `/oploverz/completed`

Struktur standar: `anime_list[]` dengan field `title`, `slug`, `poster`, `episode`, `status`.

### 6.3 Search & Detail

- **Search**: `/oploverz/search/:query`
- **Detail anime**: `/oploverz/anime/:slug`
- **Detail episode**: `/oploverz/episode/:slug`

Semua memaparkan field informasi yang sama dengan home/list plus detail episode/streaming.

---

## 7. Stream (Anime Indo)

**Prefix**: `/stream`

> Ini provider Anime Indo yang dipakai Funknime sebagai sumber tambahan (search, list, detail streaming).

### 7.1 Latest & Popular

- **Latest**: `/stream/latest`
- **Popular**: `/stream/popular`

```json
{
  "status": 200,
  "creator": "Sanka Vollerei",
  "page": 1,
  "data": [
    {
      "title": "string",
      "slug": "string-episode-10",
      "poster": "string URL",
      "episode": "10"
    }
  ]
}
```

### 7.2 List & Movie

- **List semua anime**: `/stream/list`
- **Movie**: `/stream/movie`

Keduanya memakai format sama: `data[]` berisi `title`, `slug`, `poster` (tanpa field `episode` untuk movie).

### 7.3 Genre & Search

- **Semua genre**: `/stream/genres`
- **Anime per genre**: `/stream/genres/:slug`
- **Search**: `/stream/search/:query`

Struktur utama:

```json
{
  "status": 200,
  "data": [
    {
      "title": "string",
      "slug": "string",
      "poster": "string URL",
      "type": "TV|Movie",
      "synopsis": "string"
    }
  ]
}
```

### 7.4 Detail anime & episode

- **Detail anime**: `/stream/anime/:slug`
- **Detail episode**: `/stream/episode/:slug`

```json
// Detail anime
{
  "status": 200,
  "data": {
    "title": "string",
    "slug": "string",
    "poster": "string URL",
    "synopsis": "string",
    "genres": ["Action", "Fantasy"],
    "episodes": [
      { "episode": "1", "slug": "slug-episode-1" }
    ]
  }
}

// Detail episode
{
  "status": 200,
  "data": {
    "title": "string",
    "slug": "slug-episode-1",
    "episode": "1",
    "stream_links": [
      { "server": "B-TUBE", "url": "https://..." }
    ],
    "download_links": [
      { "server": "GDRIVE", "url": "https://..." }
    ]
  }
}
```

