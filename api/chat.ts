import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are CrockonCrockAI, a highly intelligent AI assistant with exceptional programming expertise. You answer questions thoroughly, accurately, and helpfully. You excel at coding, debugging, explaining concepts, and solving complex problems. Be direct, smart, and genuinely useful.`

const RATE_LIMIT_PER_IP = 30
const RESET_MS = 24 * 60 * 60 * 1000

const ipMap = new Map<string, { count: number; resetAt: number }>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Rate limiting per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_PER_IP) {
      return new Response(
        JSON.stringify({ error: 'Daily limit reached. You can send 30 messages per day. Try again tomorrow.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
    entry.count++
  } else {
    ipMap.set(ip, { count: 1, resetAt: now + RESET_MS })
  }

  let messages: { role: string; content: string }[]
  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const stream = await groq.chat.completions.create({
    model: 'deepseek-r1-distill-llama-70b',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
