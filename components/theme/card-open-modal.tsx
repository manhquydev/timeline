'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { CARD_TEMPLATES_8_3 } from '@/lib/themes/card-templates-8-3'

interface Greeting {
  message: string
  authorName: string
}

interface CardOpenModalProps {
  isOpen: boolean
  templateId: number | null
  onClose: () => void
}

export function CardOpenModal({ isOpen, templateId, onClose }: CardOpenModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [greeting, setGreeting] = useState<Greeting | null>(null)
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')

  // Fetch random greeting when modal opens
  useEffect(() => {
    if (!isOpen) return
    setGreeting(null)
    setPhase('opening')

    fetch('/api/greetings/random?tag=8-3')
      .then((r) => r.json())
      .then((data) => setGreeting(data.greeting ?? null))
      .catch(() => setGreeting(null))
      .finally(() => {
        setTimeout(() => setPhase('open'), 600)
      })
  }, [isOpen])

  // Draw card on canvas when open
  useEffect(() => {
    if (phase !== 'open' || !canvasRef.current || templateId === null) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const template = CARD_TEMPLATES_8_3.find((t) => t.id === templateId) ?? CARD_TEMPLATES_8_3[0]
    const W = canvas.width
    const H = canvas.height

    template.drawFront(ctx, W, H)
    if (greeting) {
      // Draw greeting overlay on the card
      template.drawBack(ctx, W, H, greeting)
    }
  }, [phase, templateId, greeting])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setPhase('closed'), 300)
    }
  }, [isOpen])

  if (!isOpen && phase === 'closed') return null

  const template = templateId !== null
    ? (CARD_TEMPLATES_8_3.find((t) => t.id === templateId) ?? CARD_TEMPLATES_8_3[0])
    : CARD_TEMPLATES_8_3[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: `rgba(0,0,0,${isOpen ? '0.6' : '0'})`,
        transition: 'background-color 0.3s ease',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-4"
        style={{
          transform: `scale(${isOpen ? 1 : 0.5})`,
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        {/* Card canvas */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: `0 20px 60px ${template.glowColor}66, 0 0 30px ${template.glowColor}33`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={560}
            className="block"
            style={{ maxWidth: '85vw', maxHeight: '70vh', width: 'auto', height: 'auto' }}
          />
        </div>

        {/* Greeting text below card */}
        {phase === 'open' && greeting && (
          <div
            className="rounded-xl px-5 py-3 bg-white/90 backdrop-blur-sm shadow-lg text-center max-w-xs"
            style={{
              animation: 'fadeInUp 0.4s ease',
              borderTop: `2px solid ${template.accentColor}`,
            }}
          >
            <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{greeting.message}&rdquo;</p>
            <p className="text-xs text-gray-400 mt-1">— {greeting.authorName}</p>
          </div>
        )}

        {/* Loading state */}
        {phase === 'opening' && (
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="animate-spin">🌸</span>
            <span>Đang mở thiệp...</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
