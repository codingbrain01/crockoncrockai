# CrockonCrockAI

A personal AI chat assistant I built from scratch — fast, smart, and built especially for programming help. Powered by DeepSeek-R1 (70B) running on Groq's inference platform, hosted on Vercel.

---

## Features

- **AI Chat Interface** — Clean, distraction-free dark UI for focused conversations
- **Real-time Streaming** — Responses stream token by token as the AI generates them
- **Programming-focused** — System prompt tuned for coding, debugging, and technical explanations
- **Usage Tracker** — Live session counters for requests and tokens with progress bars
- **Owner Mode** — Gear icon in the header lets me enter a secret token to bypass public rate limits
- **Rate Limited for Public** — Visitors are limited to 30 requests/day to protect my API quota
- **API Key Protected** — Key never touches the browser; all Groq calls go through a server-side Edge function
- **Keyboard Shortcuts** — `Enter` to send, `Shift+Enter` for a new line

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | v4 | Styling |
| Groq SDK | 1.1 | AI inference client |
| DeepSeek-R1 (70B distill) | — | The AI model |
| Vercel Edge Functions | — | Server-side API proxy |

---

## Project Structure

```
crockoncrockai/
├── api/
│   └── chat.ts         # Vercel Edge function — proxies Groq, handles rate limiting
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx         # Main chat UI, settings panel, usage tracker
│   ├── main.tsx        # React entry point
│   └── index.css       # Tailwind import
├── index.html          # App shell
├── vite.config.ts      # Vite + React + Tailwind plugins
├── vercel.json         # Vercel deployment config
├── tsconfig.json       # TypeScript project references
├── tsconfig.app.json   # TypeScript config for src/
├── tsconfig.node.json  # TypeScript config for vite.config.ts
└── package.json
```

---

## How It Works

### Frontend (`src/App.tsx`)
- Sends `POST /api/chat` with the conversation history
- If an owner token is set in `localStorage`, it's sent as the `x-owner-token` header
- Reads the streaming response using the browser's `ReadableStream` API
- Estimates token usage (~4 characters per token) and displays it in the header
- Token and request counters are saved in `localStorage` — they persist across page refreshes for every user individually

### Backend (`api/chat.ts`)
- Runs as a **Vercel Edge Function**
- Checks for the `x-owner-token` header — if it matches `OWNER_TOKEN` env var, skips rate limiting
- Otherwise enforces **30 requests per IP per day** using an in-memory map
- Forwards the request to Groq using the server-side `GROQ_API_KEY`
- Streams the response back to the browser as plain text

---

## Running Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- Vercel CLI (`npm i -g vercel`) — required to run the Edge function locally

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/codingbrain01/crockoncrockai.git
   cd crockoncrockai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   OWNER_TOKEN=your_secret_password_here
   ```

4. **Start the dev server with Vercel CLI**
   ```bash
   vercel dev
   ```

   > `vercel dev` is required (not `npm run dev`) because the app calls `/api/chat` which is a Vercel Edge function. The Vite dev server alone won't handle that route.

5. Open **http://localhost:3000**

---

## Deploying to Vercel

1. Import the repo at [vercel.com](https://vercel.com)
2. Add these **Environment Variables** in Vercel project settings:

   | Variable | Value |
   |---|---|
   | `GROQ_API_KEY` | Your Groq API key |
   | `OWNER_TOKEN` | A secret password you choose |

3. Deploy — Vercel auto-detects Vite and builds correctly

---

## Owner Access

Public visitors are capped at **30 requests per day**. To use the app without limits:

1. Click the **gear icon** (⚙) in the top-right corner of the header
2. Enter the `OWNER_TOKEN` value you set in Vercel
3. Click **Save**

The token is stored in `localStorage` — you only need to enter it once per browser. A green **"Owner token active"** message confirms it's working.

To remove it, open the settings panel and click **Clear**.

---

## Usage Limits (Groq Free Tier)

| Limit | Amount | Resets |
|---|---|---|
| Requests per day | 1,000 | Midnight UTC |
| Requests per minute | 30 | Every 60 seconds |
| Tokens per day | 500,000 | Midnight UTC |
| Tokens per minute | 6,000 | Every 60 seconds |

Public visitors are further limited to **30 requests/day per IP** by the serverless function. Each visitor's usage counter is tracked in their own browser `localStorage` and persists across page refreshes.

---

## License

MIT
