# CrockonCrockAI

A smart, fast AI chat assistant with exceptional programming expertise — built with React, TypeScript, and powered by DeepSeek-R1 via Groq's free API.

---

## Features

- **AI Chat Interface** — Clean, modern dark-themed chat UI
- **DeepSeek-R1 Powered** — A reasoning model that thinks step by step before answering
- **Streaming Responses** — Text appears in real time as the AI generates it
- **Usage Tracker** — Live counters for daily requests and tokens used with progress bars
- **Keyboard Shortcuts** — Press `Enter` to send, `Shift+Enter` for a new line
- **Conversation Memory** — Full chat history is maintained within each session

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Frontend framework |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Styling |
| Groq SDK | API client for AI inference |
| DeepSeek-R1 (70B) | AI model via Groq |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codingbrain01/crockoncrockai.git
   cd crockoncrockai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**

   Create a `.env` file in the root of the project:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

   > Get your free API key at [console.groq.com](https://console.groq.com)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173** in your browser

---

## Usage Limits (Groq Free Tier)

CrockonCrockAI runs on Groq's free tier. Limits reset daily and per minute:

| Limit | Amount | Resets |
|---|---|---|
| Requests per day | 1,000 | Every 24 hours (midnight UTC) |
| Requests per minute | 30 | Every 60 seconds |
| Tokens per day | 500,000 | Every 24 hours |
| Tokens per minute | 6,000 | Every 60 seconds |

The app displays your current usage in the header after your first message.

---

## Project Structure

```
crockoncrockai/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx        # Main chat interface
│   ├── main.tsx       # App entry point
│   └── index.css      # Global styles (Tailwind)
├── .env               # API key (not committed)
├── .gitignore
├── index.html
└── package.json
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GROQ_API_KEY` | Your Groq API key |

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

---

## License

MIT
