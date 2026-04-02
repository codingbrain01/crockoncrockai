# CrockonCrockAI

A personal AI chat assistant I built from scratch — fast, smart, and built especially for programming help. Powered by Llama 3.3 70B running on Groq's inference platform, hosted on Vercel.

---

## Features

- **AI Chat Interface** — Clean, distraction-free dark UI for focused conversations
- **Real-time Streaming** — Responses stream token by token as the AI generates them
- **Programming-focused** — System prompt tuned for coding, debugging, and technical explanations
- **Persistent Conversations** — Each user's conversation is saved in `localStorage` and survives page refreshes; logging out as owner restores the visitor conversation
- **Daily Counter Reset** — Request and token counters automatically reset at midnight UTC
- **Usage Tracker** — Live counters for requests and tokens with progress bars, persisted and reset daily per user
- **Owner Mode** — Gear icon opens a login panel; owner gets unlimited requests and a separate persistent conversation
- **Owner Badge** — Green "Owner" badge in the header when logged in, with a visible Logout button
- **Rate Limited for Visitors** — Visitors are limited to 30 requests/day to protect the API quota
- **API Key Protected** — Key never touches the browser; all Groq calls go through a server-side Node.js function
- **Input Sanitization** — Messages are sanitized on both frontend and backend before being processed
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
| Llama 3.3 70B | — | The AI model |
| Vercel Serverless Functions | — | Server-side API proxy |

---

## Project Structure

```
crockoncrockai/
├── api/
│   └── chat.ts         # Vercel serverless function — proxies Groq, rate limiting, sanitization
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx         # Main chat UI, owner mode, usage tracker, conversation persistence
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
- Sanitizes input (strips control characters, caps at 4,000 chars) before sending
- Sends `POST /api/chat` with the conversation history
- If an owner token is stored in `localStorage`, sends it as `x-owner-token` header
- Reads the streaming response using the browser's `ReadableStream` API
- Estimates token usage (~4 characters per token) and tracks it per user in `localStorage`
- Owner and visitor conversations, request counts, and token counts are all stored separately

### Backend (`api/chat.ts`)
- Runs as a **Vercel Node.js serverless function** (30s max duration)
- Validates and sanitizes all incoming messages (strips control chars, caps at 4,000 chars, max 50 messages)
- Checks `x-owner-token` header — if it matches `OWNER_TOKEN` env var, skips rate limiting
- Otherwise enforces **30 requests per IP per day** using an in-memory map
- Forwards the request to Groq using the server-side `GROQ_API_KEY`
- Streams the response back to the browser as chunked plain text

### Conversation Persistence
- **Owner** — conversation saved as `ownerMessages`; logging out restores the visitor conversation; logging back in restores the owner conversation
- **Visitors** — each browser gets a unique visitor ID on first visit; conversation saved as `visitorMessages_{id}`
- **Counters** — tracked separately for owner and per visitor; each counter stores its date and auto-resets to 0 at midnight UTC

---

## Running Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- Vercel CLI (`npm i -g vercel`) — required to run the serverless function locally

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

4. **Start the dev server**
   ```bash
   vercel dev
   ```

   > `vercel dev` is required (not `npm run dev`) because the app calls `/api/chat` which is a Vercel serverless function. The Vite dev server alone won't handle that route.

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

Public visitors are capped at **30 requests per day**. To use the app as owner:

1. Click the **gear icon** (⚙) in the header
2. Enter your `OWNER_TOKEN`
3. Click **Login**

- A green **Owner** badge appears in the header next to the title
- Click **Logout** (next to the badge) to log out — screen clears, conversation stays saved
- Log back in to restore your conversation
- Your request limit shows as **X / 1,000** instead of X / 30

---

## Usage Limits (Groq Free Tier)

| Limit | Amount | Resets |
|---|---|---|
| Requests per day | 1,000 | Midnight UTC |
| Requests per minute | 30 | Every 60 seconds |
| Tokens per day | 500,000 | Midnight UTC |
| Tokens per minute | 6,000 | Every 60 seconds |

Visitors are further capped at **30 requests/day per IP**. Each user's counters persist in their own browser across refreshes.

---

## License

MIT
