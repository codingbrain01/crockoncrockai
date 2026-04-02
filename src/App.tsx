import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DAILY_TOKEN_LIMIT = 500000

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const [requestsUsed, setRequestsUsed] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Something went wrong.')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const delta = decoder.decode(value)
        assistantContent += delta
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantContent },
        ])
      }

      const inputChars = newMessages.reduce((acc, m) => acc + m.content.length, 0)
      const estimatedTokens = Math.ceil((inputChars + assistantContent.length) / 4)
      setTokensUsed(prev => prev + estimatedTokens)
      setRequestsUsed(prev => prev + 1)
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: err instanceof Error ? err.message : 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">C</div>
        <div className="flex-1">
          <h1 className="font-semibold text-white">CrockonCrockAI</h1>
          <p className="text-xs text-gray-400">Powered by DeepSeek-R1</p>
        </div>
        {requestsUsed > 0 && (
          <div className="text-right flex flex-col gap-1">
            <div>
              <p className="text-xs text-gray-400">Requests today</p>
              <p className="text-xs font-medium text-indigo-400">{requestsUsed} / 1,000</p>
              <div className="w-28 h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-1 bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min((requestsUsed / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tokens today</p>
              <p className="text-xs font-medium text-indigo-400">
                {tokensUsed.toLocaleString()} / {DAILY_TOKEN_LIMIT.toLocaleString()}
              </p>
              <div className="w-28 h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-1 bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min((tokensUsed / DAILY_TOKEN_LIMIT) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold">C</div>
            <h2 className="text-xl font-semibold">CrockonCrockAI</h2>
            <p className="text-gray-400 max-w-sm">Your intelligent programming assistant. Ask me anything.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shrink-0">C</div>
            )}
            <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-gray-800 text-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shrink-0">C</div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="px-4 py-4 border-t border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500 min-h-12 max-h-50"
            placeholder="Ask CrockonCrockAI anything..."
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </footer>
    </div>
  )
}

export default App
