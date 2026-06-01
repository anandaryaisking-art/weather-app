# WeatherNow ☁️

A modern, full-stack weather application built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Prisma ORM**, and the **OpenWeatherMap API**. Features real-time weather data, 5-day forecasts, animated backgrounds, analytics dashboard, and a beautiful glassmorphism UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## ✨ Features

### Weather
- 🔍 **City Search** with autocomplete suggestions
- 📍 **Geolocation** — one-click weather for your current location
- 🌡️ **Current Weather** — temperature, feels like, humidity, wind, pressure, visibility
- 📅 **5-Day Forecast** with daily high/low, precipitation, and wind
- 🌍 **Local Date & Time** for any searched city
- 🔄 **Celsius / Fahrenheit** toggle

### UI / UX
- 🌙 **Dark / Light Mode** toggle
- 🎨 **Glassmorphism** design with backdrop blur
- 🌧️ **Animated Backgrounds** — rain, snow, clouds, lightning, fog, sun glow
- 📱 **Fully Responsive** — desktop, tablet, mobile
- ❤️ **Favorite Cities** — save and quickly access your favorites

### Analytics & Data
- 📊 **Analytics Dashboard** — bar, pie, and area charts
- 🔥 **Most Searched Cities** and search trends
- 📜 **Search History** with timestamps
- 🗄️ **Database** via Prisma ORM (SQLite for dev, PostgreSQL for prod)

### Technical
- 6 RESTful API endpoints
- Graceful database fallback (app works without DB configured)
- Input validation & sanitization
- Comprehensive error handling
- Docker configuration included

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+ (or Bun)
- **OpenWeatherMap API key** — [Get one free](https://openweathermap.org/api)

> **Note:** Local development uses SQLite — no external database needed!

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/weathernow.git
cd weathernow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` — only the API key is required for local dev:

```env
DATABASE_URL=file:./db/weathernow.db
OPENWEATHERMAP_API_KEY=your_api_key_here
```

### 4. Set Up Database

```bash
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

Vercel requires PostgreSQL (SQLite doesn't work on serverless). Follow these steps:

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/weathernow.git
git push -u origin main
```

### Step 2: Create a PostgreSQL Database

Use any of these free providers:

| Provider | Free Tier | URL |
|----------|-----------|-----|
| Neon     | 0.5 GB    | [neon.tech](https://neon.tech) |
| Supabase | 500 MB    | [supabase.com](https://supabase.com) |
| Railway  | $5 credit | [railway.app](https://railway.app) |

Copy the **connection string** (looks like `postgresql://user:password@host:5432/dbname`).

### Step 3: Switch to PostgreSQL Schema

Before deploying, switch the Prisma schema to PostgreSQL:

```bash
npm run db:switch:prod
```

This copies `prisma/schema.production.prisma` over `prisma/schema.prisma`, changing the provider from SQLite to PostgreSQL.

Commit this change:

```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### Step 4: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add these **Environment Variables**:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `OPENWEATHERMAP_API_KEY` — your OpenWeatherMap API key
4. Click **Deploy**

### Step 5: Initialize the Database

After the first deploy, run:

```bash
npx prisma db push
```

Or add `npx prisma db push` as a Vercel **Build Command** override.

### Switching Back to Local Dev

To go back to SQLite for local development:

```bash
npm run db:switch:dev
```

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t weathernow .

# Run with PostgreSQL
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/weathernow" \
  -e OPENWEATHERMAP_API_KEY="your_api_key" \
  weathernow
```

### Docker Compose (includes PostgreSQL)

```bash
docker compose up -d
```

This starts both the app and a PostgreSQL database. Set your `OPENWEATHERMAP_API_KEY` in `docker-compose.yml` or use a `.env` file.

---

## 📁 Project Structure

```
weathernow/
├── prisma/
│   ├── schema.prisma              # Database schema (SQLite for dev)
│   └── schema.production.prisma   # Database schema (PostgreSQL for prod)
├── public/                        # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/         # GET analytics data
│   │   │   ├── favorites/         # GET, POST, DELETE favorites
│   │   │   ├── forecast/          # GET 5-day forecast
│   │   │   ├── geocode/           # GET city autocomplete
│   │   │   ├── search-history/    # GET, DELETE search history
│   │   │   └── weather/           # GET current weather
│   │   ├── globals.css            # Global styles + animations
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main application page
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   └── weather/
│   │       ├── AnalyticsDashboard.tsx
│   │       ├── CurrentWeather.tsx
│   │       ├── DarkModeToggle.tsx
│   │       ├── FavoriteCities.tsx
│   │       ├── ForecastDisplay.tsx
│   │       ├── TemperatureToggle.tsx
│   │       ├── WeatherBackground.tsx
│   │       ├── WeatherSearch.tsx
│   │       └── weather-utils.ts
│   └── lib/
│       ├── db.ts                  # Prisma client
│       ├── store.ts               # Zustand state
│       ├── utils.ts               # Utility functions
│       └── weather-api.ts         # OpenWeatherMap API helper
├── .env.example                   # Environment template
├── .gitignore
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose
├── next.config.ts                 # Next.js config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── API_DOCUMENTATION.md           # API reference
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/weather`        | Current weather          |
| GET    | `/api/forecast`       | 5-day forecast           |
| GET    | `/api/geocode`        | City autocomplete search |
| GET    | `/api/search-history` | Get search history       |
| DELETE | `/api/search-history` | Clear search history     |
| GET    | `/api/analytics`      | Analytics data           |
| GET    | `/api/favorites`      | List favorite cities     |
| POST   | `/api/favorites`      | Add a favorite city      |
| DELETE | `/api/favorites`      | Remove a favorite city   |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full request/response details.

---

## 🛠️ Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript 5                        |
| Styling        | Tailwind CSS 4 + shadcn/ui          |
| Database       | Prisma ORM (SQLite / PostgreSQL)    |
| State          | Zustand                             |
| Charts         | Recharts                            |
| API            | OpenWeatherMap API                  |
| Animations     | Framer Motion + CSS Keyframes       |
| Icons          | Lucide React                        |
| Notifications  | Sonner                              |

---

## ⚙️ Environment Variables

| Variable                 | Required | Description                                    |
|--------------------------|----------|------------------------------------------------|
| `DATABASE_URL`           | Yes      | SQLite path (dev) or PostgreSQL URL (prod)     |
| `OPENWEATHERMAP_API_KEY` | Yes      | Your OpenWeatherMap API key                     |

### Local Development (SQLite)

```env
DATABASE_URL=file:./db/weathernow.db
```

### Production (PostgreSQL)

```env
DATABASE_URL=postgresql://user:password@host:5432/weathernow
```

---

## 📝 Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma database browser
npm run db:switch:prod   # Switch schema to PostgreSQL
npm run db:switch:dev    # Switch schema back to SQLite
```

---

## 📄 License

MIT License — feel free to use this project for your portfolio or as a starting point for your own weather app.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
