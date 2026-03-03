import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatCore, type ChatCoreHandle } from './ChatCore'

// localStorage key — set on first auto-open; prevents future auto-opens
const LS_WELCOMED = 'roa-assistant-welcomed'

// ── Greeting panel ────────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  'What was the 1961 plebiscite?',
  'What is the UN Trusteeship Agreement?',
  'What did the ICJ rule in Bakassi?',
]

interface GreetingPanelProps {
  onQuickQuestion: (text: string) => void
  onQuickEscalate: () => void
}

function GreetingPanel({ onQuickQuestion, onQuickEscalate }: GreetingPanelProps) {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-parchment-50 px-5 py-5">
      <div className="h-px w-8 bg-gold-500 mb-4" />

      <p className="text-sm font-sans text-navy-700/80 leading-relaxed mb-2">
        Explore the constitutional and historical record of the Republic of Ambazonia (ROA)
        through its primary source documentation.
      </p>
      <p className="text-sm font-sans text-navy-700/55 leading-relaxed mb-5">
        Every response draws on verified UN instruments, legal proceedings, and official
        institutional records. Select a topic below to begin, or ask your own question.
      </p>

      <div className="flex flex-col gap-2">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => onQuickQuestion(q)}
            className="text-left text-xs font-sans px-3 py-2 border border-slate-200 bg-white text-navy-700/70 hover:border-gold-400 hover:text-navy-900 transition-colors"
          >
            {q}
          </button>
        ))}

        <button
          onClick={onQuickEscalate}
          className="text-left text-xs font-sans px-3 py-2 border border-slate-200 bg-white text-navy-700/45 hover:border-gold-400 hover:text-navy-700 transition-colors italic"
        >
          Speak with a human reviewer
        </button>
      </div>
    </div>
  )
}

// ── Floating trigger button ───────────────────────────────────────────────────

function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open research assistant"
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-navy-900 text-parchment-100 px-4 py-2.5 text-sm font-sans hover:bg-navy-800 transition-colors shadow-lg"
    >
      <span className="text-gold-400/80 text-base leading-none" aria-hidden="true">◎</span>
      Ask ROA
    </button>
  )
}

// ── Slide-over panel ──────────────────────────────────────────────────────────

interface ChatPanelProps {
  isOpen:          boolean
  onClose:         () => void
  hasOpened:       boolean
  showGreeting:    boolean
  onQuickQuestion: (text: string) => void
  onQuickEscalate: () => void
  chatRef:         React.RefObject<ChatCoreHandle | null>
}

function ChatPanel({
  isOpen,
  onClose,
  hasOpened,
  showGreeting,
  onQuickQuestion,
  onQuickEscalate,
  chatRef,
}: ChatPanelProps) {
  return (
    <>
      {/* Mobile backdrop — tap to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/40 z-[99] sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel — always in DOM so CSS transition plays smoothly */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ROA Research Assistant"
        className={
          'fixed z-[100] flex flex-col bg-white shadow-2xl ' +
          'inset-y-0 right-0 w-full sm:w-[420px] ' +
          'border-l border-slate-200 ' +
          'transition-transform duration-300 ease-in-out ' +
          (isOpen ? 'translate-x-0' : 'translate-x-full')
        }
      >
        {/* Panel header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-navy-800 bg-navy-900">
          <div className="flex items-center gap-2">
            <span className="text-gold-400/80 text-sm leading-none" aria-hidden="true">◎</span>
            <span className="text-sm font-sans text-parchment-100">ROA Research Assistant</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="text-parchment-200/50 hover:text-parchment-200 transition-colors text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* First-visit greeting with quick actions */}
        {hasOpened && showGreeting && (
          <GreetingPanel
            onQuickQuestion={onQuickQuestion}
            onQuickEscalate={onQuickEscalate}
          />
        )}

        {/* Chat content — lazy mounted on first open; fills remaining height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {hasOpened && <ChatCore ref={chatRef} mode="panel" />}
        </div>
      </div>
    </>
  )
}

// ── GlobalAssistant ───────────────────────────────────────────────────────────

export function GlobalAssistant() {
  const { pathname }              = useLocation()
  const [isOpen, setIsOpen]       = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const chatRef = useRef<ChatCoreHandle | null>(null)

  // Auto-open once on the homepage — only on the very first visit
  useEffect(() => {
    if (pathname !== '/') return
    try {
      if (localStorage.getItem(LS_WELCOMED)) return
      localStorage.setItem(LS_WELCOMED, 'true')
    } catch {
      return // storage unavailable — skip auto-open
    }
    setIsOpen(true)
    setHasOpened(true)
    setShowGreeting(true)
  }, [pathname])

  // Suppress entirely on the dedicated chat page
  if (pathname === '/research/chat') return null

  function open() {
    setIsOpen(true)
    setHasOpened(true)
    // greeting only shows on the auto-open — not on manual opens
  }

  function close() {
    setIsOpen(false)
    setShowGreeting(false)
  }

  function handleQuickQuestion(text: string) {
    setShowGreeting(false)
    chatRef.current?.submitQuestion(text)
  }

  function handleQuickEscalate() {
    setShowGreeting(false)
    chatRef.current?.openEscalation()
  }

  return (
    <>
      {!isOpen && <FloatingButton onClick={open} />}
      <ChatPanel
        isOpen={isOpen}
        onClose={close}
        hasOpened={hasOpened}
        showGreeting={showGreeting}
        onQuickQuestion={handleQuickQuestion}
        onQuickEscalate={handleQuickEscalate}
        chatRef={chatRef}
      />
    </>
  )
}
