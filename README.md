# CrockonCrockAI

A personal AI chat assistant I built from scratch — fast, smart, and built especially for programming help. Powered by Llama 3.3 70B running on Groq's inference platform, hosted on Vercel.

---

## Features

- **AI Chat Interface** — Clean, distraction-free dark UI for focused conversations
- **Real-time Streaming** — Responses stream token by token as the AI generates them
- **Programming-focused** — System prompt tuned for coding, debugging, and technical explanations
- **Persistent Conversations** — Each user's conversation survives page refreshes; owner and visitor conversations are stored separately
- **Smart Logout** — Logging out as owner restores your visitor conversation; logging back in restores your owner conversation
- **Daily Counter Reset** — Request and token counters automatically reset at midnight UTC
- **Usage Tracker** — Live counters for requests and tokens with progress bars, persisted and reset daily per user
- **Owner Mode** — Gear icon opens a login panel; owner gets unlimited requests and a separate persistent conversation
- **Owner Badge** — Green "Owner" badge in the header when logged in, with a visible Logout button
- **Rate Limited for Visitors** — Visitors are capped at 30 requests/day per IP to protect the API quota
- **API Key Protected** — Key never touches the browser; all Groq calls go through a server-side Node.js function
- **Input Sanitization** — Messages sanitized on both frontend and backend (control chars stripped, 4,000 char limit, max 50 messages in history)
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
| Vercel Node.js Serverless | — | Server-side API proxy (30s timeout) |

---

## Project Structure

```
crockoncrockai/
├── api/
│   └── chat.ts         # Vercel serverless function — Groq proxy, rate limiting, sanitization
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx         # Main chat UI — owner mode, usage tracker, conversation persistence
│   ├── main.tsx        # React entry point
│   └── index.css       # Tailwind import
├── index.html          # App shell
├── vite.config.ts      # Vite + React + Tailwind plugins
├── vercel.json         # Vercel deployment config (framework, build, function timeout)
├── tsconfig.json       # TypeScript project references
├── tsconfig.app.json   # TypeScript config for src/
├── tsconfig.node.json  # TypeScript config for vite.config.ts
└── package.json
```

---

## How It Works

### Frontend (`src/App.tsx`)

**Key constants:**
| Constant | Value | Purpose |
|---|---|---|
| `DAILY_TOKEN_LIMIT` | 500,000 | Token counter max display |
| `OWNER_REQUEST_LIMIT` | 1,000 | Request counter max for owner |
| `VISITOR_REQUEST_LIMIT` | 30 | Request counter max for visitors |

**What it does:**
- On load, checks if owner token exists in `localStorage` — loads owner or visitor conversation accordingly
- Counters load via `getCounter()` which auto-resets to 0 if the saved UTC date doesn't match today
- Sanitizes input (strips control chars, caps at 4,000 chars) before sending
- Sends `POST /api/chat` with full conversation history; includes `x-owner-token` header if logged in
- Reads streaming response via `ReadableStream` API, appending chunks in real time
- After each response, estimates tokens (~4 chars per token) and saves counters with today's UTC date

**localStorage keys used:**
| Key | What's stored |
|---|---|
| `ownerToken` | Owner password (set once, persists) |
| `ownerMessages` | Owner's conversation history |
| `ownerRequestsUsed` / `ownerRequestsUsed_date` | Owner's daily request count + date |
| `ownerTokensUsed` / `ownerTokensUsed_date` | Owner's daily token count + date |
| `visitorId` | Unique ID generated on first visit |
| `visitorMessages_{id}` | Visitor's conversation history |
| `visitorRequestsUsed_{id}` / `_date` | Visitor's daily request count + date |
| `visitorTokensUsed_{id}` / `_date` | Visitor's daily token count + date |

### Backend (`api/chat.ts`)

**Key constants:**
| Constant | Value | Purpose |
|---|---|---|
| `RATE_LIMIT_PER_IP` | 30 | Max requests per IP per day |
| `MAX_MESSAGE_LENGTH` | 4,000 | Max chars per message |
| `MAX_MESSAGES` | 50 | Max messages passed to Groq |
| `SYSTEM_PROMPT` | — | AI personality and instructions |

**What it does:**
- Checks `x-owner-token` header against `OWNER_TOKEN` env var — skips rate limiting if matched
- Otherwise enforces 30 requests/IP/day via in-memory map (resets after 24 hours)
- Validates messages array structure and sanitizes all content
- Calls Groq with `llama-3.3-70b-versatile` and streams the response back as chunked plain text

---

## Configuring the AI

Everything you'd want to change is in `api/chat.ts`:

| What to change | Where |
|---|---|
| AI personality / behavior | `SYSTEM_PROMPT` |
| AI model | `model: 'llama-3.3-70b-versatile'` |
| Visitor daily request limit | `RATE_LIMIT_PER_IP` |
| Max message length | `MAX_MESSAGE_LENGTH` |
| Max conversation history sent | `MAX_MESSAGES` |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- Vercel CLI — `npm i -g vercel`

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

   > `vercel dev` is required — not `npm run dev`. The app calls `/api/chat` which is a Vercel serverless function that the Vite dev server can't handle alone.

5. Open **http://localhost:3000**

---

## Deploying to Vercel

1. Import the repo at [vercel.com](https://vercel.com)
2. Add these **Environment Variables**:

   | Variable | Value |
   |---|---|
   | `GROQ_API_KEY` | Your Groq API key |
   | `OWNER_TOKEN` | A secret password you choose |

   Leave all environments checked (Production, Preview, Development).

3. Deploy — Vercel auto-detects Vite and builds correctly

---

## Owner Access

1. Click the **gear icon** (⚙) in the header
2. Enter your `OWNER_TOKEN`
3. Click **Login**

**While logged in:**
- Green **Owner** badge appears next to the title
- Request limit shows as **X / 1,000** instead of X / 30
- Your conversation is saved separately from your visitor conversation
- Click **Logout** next to the badge to switch back to visitor mode — your owner conversation stays saved

**Logging back in** restores your owner conversation and counters exactly as you left them.

---

## Usage Limits (Groq Free Tier)

| Limit | Amount | Resets |
|---|---|---|
| Requests per day | 1,000 | Midnight UTC |
| Requests per minute | 30 | Every 60 seconds |
| Tokens per day | 500,000 | Midnight UTC |
| Tokens per minute | 6,000 | Every 60 seconds |

Visitors are further capped at **30 requests/day per IP** by the serverless function. All counters in the UI reset automatically at midnight UTC.

---

## License

MIT
