# CrockonCrockAI

A personal AI chat assistant I built — smart, fast, and especially strong at programming. Powered by DeepSeek-R1 running on Groq's inference platform.

---

## What It Does

- Chat with an AI that's great at coding, debugging, and explaining technical concepts
- Responses stream in real time as the AI generates them
- Tracks how many requests and tokens you've used today
- Clean dark UI, simple and focused

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Frontend |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| Groq SDK | AI inference |
| DeepSeek-R1 (70B) | The AI model |
| Vercel | Hosting + serverless API |

---

## How I Built It

I wanted a personal AI assistant I could use for programming without hitting usage limits or paying a subscription. I chose Groq's free API because of its generous daily limits and fast inference speed — responses feel near-instant compared to most alternatives.

The API key is protected server-side via a Vercel Edge function so it's never exposed in the browser. I also added per-IP rate limiting so the public demo doesn't get abused.

---

## Running It Locally

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

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
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173**

---

## Deploying to Vercel

1. Import the repo at [vercel.com](https://vercel.com)
2. Add environment variable: `GROQ_API_KEY` = your Groq API key
3. Deploy

> Note: Use `GROQ_API_KEY` (not `VITE_GROQ_API_KEY`) for Vercel — the API key stays server-side.

---

## Usage Limits (Groq Free Tier)

| Limit | Amount | Resets |
|---|---|---|
| Requests per day | 1,000 | Midnight UTC |
| Requests per minute | 30 | Every 60 seconds |
| Tokens per day | 500,000 | Midnight UTC |

Public visitors are limited to **30 requests per day** to protect the quota.

---

## Project Structure

```
crockoncrockai/
├── api/
│   └── chat.ts        # Vercel Edge function (proxies Groq, rate limiting)
├── public/
├── src/
│   ├── App.tsx        # Chat UI
│   ├── main.tsx
│   └── index.css
├── .env               # API key (not committed)
├── vercel.json
└── package.json
```

---

## License

MIT
