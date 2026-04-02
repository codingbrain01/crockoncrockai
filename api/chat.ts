import type { IncomingMessage, ServerResponse } from 'http'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are CrockonCrockAI, a highly intelligent AI assistant with exceptional programming expertise. You answer questions thoroughly, accurately, and helpfully. You excel at coding, debugging, explaining concepts, and solving complex problems. Be direct, smart, and genuinely useful.`

const RATE_LIMIT_PER_IP = 30
const RESET_MS = 24 * 60 * 60 * 1000
const ipMap = new Map<string, { count: number; resetAt: number }>()

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log('[chat] request received', req.method)

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method not allowed')
    return
  }

  // Check owner token
  const ownerToken = req.headers['x-owner-token'] as string | undefined
  const isOwner = ownerToken && ownerToken === process.env.OWNER_TOKEN
  console.log('[chat] isOwner:', isOwner, '| OWNER_TOKEN set:', !!process.env.OWNER_TOKEN, '| GROQ_API_KEY set:', !!process.env.GROQ_API_KEY)

  if (!isOwner) {
    const forwarded = req.headers['x-forwarded-for']
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() ?? 'unknown'
    const now = Date.now()
    const entry = ipMap.get(ip)

    if (entry && now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT_PER_IP) {
        console.log('[chat] rate limit hit for ip:', ip)
        res.statusCode = 429
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Daily limit reached. You can send 30 messages per day. Try again tomorrow.' }))
        return
      }
      entry.count++
    } else {
      ipMap.set(ip, { count: 1, resetAt: now + RESET_MS })
    }
  }

  // Parse request body
  let messages: { role: string; content: string }[]
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = ''
      req.on('data', chunk => { data += chunk })
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })
    messages = JSON.parse(raw).messages
    console.log('[chat] parsed messages count:', messages.length)
  } catch (e) {
    console.error('[chat] body parse error:', e)
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid request body.' }))
    return
  }

  // Stream response from Groq
  console.log('[chat] calling Groq...')
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    const stream = await groq.chat.completions.create({
      model: 'deepseek-r1-distill-llama-70b',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    })

    console.log('[chat] stream started')
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) res.write(text)
    }
    console.log('[chat] stream complete')
  } catch (e) {
    console.error('[chat] Groq error:', e)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'AI request failed. Please try again.' }))
    }
    return
  }

  res.end()
}
