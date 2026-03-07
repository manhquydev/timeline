'use client'

import { useState, useRef, useEffect } from 'react'
import { PenLine, X, Send, ArrowLeft } from 'lucide-react'
import { CARD_TEMPLATES_8_3 } from '@/lib/themes/card-templates-8-3'

const MAX_CHARS = 280

interface GreetingWriteFormProps {
  onCardCreated?: (data: { templateId: number; message: string }) => void
}

export function GreetingWriteForm({ onCardCreated }: GreetingWriteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const thumbRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const remaining = MAX_CHARS - message.length
  const isOverLimit = remaining < 0
  const isEmpty = message.trim().length === 0

  // Draw template thumbnails whenever step 1 becomes visible
  useEffect(() => {
    if (!isOpen || step !== 1) return
    const raf = requestAnimationFrame(() => {
      thumbRefs.current.forEach((canvas, i) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        CARD_TEMPLATES_8_3[i].drawFront(ctx, canvas.width, canvas.height)
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [isOpen, step])

  function handleOpen() {
    setIsOpen(true)
    setStep(1)
    setSelectedTemplateId(null)
    setMessage('')
    setSubmitted(false)
  }

  function handleSelectTemplate(id: number) {
    setSelectedTemplateId(id)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEmpty || isOverLimit || isSubmitting || !selectedTemplateId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/greetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), eventTag: '8-3', templateId: selectedTemplateId }),
      })
      if (res.ok) {
        // Inject card into falling scene immediately (before admin approval)
        onCardCreated?.({ templateId: selectedTemplateId, message: message.trim() })
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setIsOpen(false)
          setStep(1)
          setMessage('')
          setSelectedTemplateId(null)
        }, 3000)
      }
    } catch {
      // Silent fail — will retry next time
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTemplate = CARD_TEMPLATES_8_3.find((t) => t.id === selectedTemplateId)

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95 md:bottom-8"
        style={{
          background: 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
          boxShadow: '0 4px 20px rgba(255, 77, 109, 0.4)',
        }}
        aria-label="Tạo thiệp 8/3"
      >
        <PenLine size={16} />
        <span>Tạo thiệp</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-pink-50"
              style={{ background: 'linear-gradient(135deg, #FF4D6D15, #FF85A115)' }}
            >
              <div className="flex items-center gap-2">
                {step === 2 && !submitted && (
                  <button
                    onClick={() => setStep(1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft size={15} />
                  </button>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {submitted ? '🎉 Thiệp đã tung lên!' : step === 1 ? '🌹 Chọn mẫu thiệp' : '✍️ Viết lời chúc'}
                  </h3>
                  {step === 2 && !submitted && selectedTemplate && (
                    <p className="text-xs text-gray-400 mt-0.5">{selectedTemplate.name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!submitted && (
                  <div className="flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 1 ? 'bg-pink-500' : 'bg-pink-200'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 2 ? 'bg-pink-500' : 'bg-pink-200'}`} />
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Step 1: Template picker */}
            {!submitted && step === 1 && (
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-3 text-center">
                  Thiệp của bạn sẽ rơi trên trang chủ và hiển thị lời chúc khi ai đó chạm vào 🌸
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {CARD_TEMPLATES_8_3.map((template, i) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.id)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className="rounded-xl overflow-hidden border-2 border-transparent group-hover:border-pink-400 group-active:scale-95 transition-all shadow-sm"
                        style={{ boxShadow: `0 2px 10px ${template.glowColor}44` }}
                      >
                        <canvas
                          ref={(el) => { thumbRefs.current[i] = el }}
                          width={80}
                          height={112}
                          className="block"
                        />
                      </div>
                      <span className="text-xs text-gray-500 text-center leading-tight px-1">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Write message */}
            {!submitted && step === 2 && (
              <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Viết lời chúc của bạn... 🌸"
                  rows={4}
                  maxLength={MAX_CHARS + 20}
                  autoFocus
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                />
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{ color: isOverLimit ? '#ef4444' : remaining < 40 ? '#f97316' : '#9ca3af' }}
                  >
                    {remaining} ký tự còn lại
                  </span>
                  <button
                    type="submit"
                    disabled={isEmpty || isOverLimit || isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isEmpty || isOverLimit ? '#d1d5db' : 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
                    }}
                  >
                    {isSubmitting ? <span className="animate-spin">🌸</span> : <Send size={14} />}
                    Tung thiệp
                  </button>
                </div>
              </form>
            )}

            {/* Success state */}
            {submitted && <SuccessState templateId={selectedTemplateId!} />}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function SuccessState({ templateId }: { templateId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const template = CARD_TEMPLATES_8_3.find((t) => t.id === templateId) ?? CARD_TEMPLATES_8_3[0]

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    template.drawFront(ctx, canvasRef.current.width, canvasRef.current.height)
  }, [template])

  return (
    <div className="px-5 py-6 flex flex-col items-center gap-3 text-center">
      <div style={{ animation: 'floatUp 0.5s ease forwards' }}>
        <canvas
          ref={canvasRef}
          width={100}
          height={140}
          className="rounded-xl block mx-auto"
          style={{ boxShadow: `0 8px 24px ${template.glowColor}66` }}
        />
      </div>
      <p className="font-semibold text-gray-800">Thiệp đã được tung lên! 🌸</p>
      <p className="text-xs text-gray-500 max-w-[240px]">
        Thiệp đang rơi trên trang chủ. Sau khi duyệt, lời chúc sẽ hiển thị khi ai đó chạm vào thiệp.
      </p>
      <style jsx>{`
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
