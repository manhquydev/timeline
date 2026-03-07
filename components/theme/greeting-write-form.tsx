'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, PenLine, Send, Sparkles, X } from 'lucide-react'

import { CARD_TEMPLATES_8_3 } from '@/lib/themes/card-templates-8-3'

const MAX_CHARS = 280

interface GreetingWriteFormProps {
  eventTag: string
  eventId?: string
  eventSlug?: string
  eventTitle?: string
  onCardCreated?: (data: { templateId: number; message: string }) => void
  allowedTemplateIds?: number[]
}

export function GreetingWriteForm({
  eventTag,
  eventId,
  eventSlug,
  eventTitle,
  onCardCreated,
  allowedTemplateIds,
}: GreetingWriteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const thumbRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const templates = useMemo(() => {
    if (!allowedTemplateIds || allowedTemplateIds.length === 0) {
      return CARD_TEMPLATES_8_3
    }
    return CARD_TEMPLATES_8_3.filter((template) => allowedTemplateIds.includes(template.id))
  }, [allowedTemplateIds])

  const remaining = MAX_CHARS - message.length
  const isOverLimit = remaining < 0
  const isEmpty = message.trim().length === 0

  useEffect(() => {
    if (!isOpen || step !== 1) return

    const raf = requestAnimationFrame(() => {
      thumbRefs.current.forEach((canvas, i) => {
        if (!canvas || !templates[i]) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        templates[i].drawFront(ctx, canvas.width, canvas.height)
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [isOpen, step, templates])

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
      const response = await fetch('/api/greetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          eventTag,
          eventId: eventId || null,
          eventSlug: eventSlug || null,
          templateId: selectedTemplateId,
        }),
      })

      if (response.ok) {
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
      // Silent fail, user can retry.
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTemplate = templates.find((item) => item.id === selectedTemplateId)

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed right-4 fab-bottom-secondary z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-semibold transition-transform hover:scale-105 active:scale-95 md:bottom-8"
        style={{
          background: 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
          boxShadow: '0 4px 20px rgba(255, 77, 109, 0.4)',
        }}
        aria-label={`Tạo thiệp cho sự kiện ${eventTag}`}
      >
        <PenLine size={16} />
        <span>Viết thiệp</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md mx-3 mb-3 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'slideUp 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-pink-50"
              style={{ background: 'linear-gradient(135deg, #FF4D6D15, #FF85A115)' }}
            >
              <div className="flex items-center gap-2">
                {step === 2 && !submitted && (
                  <button
                    onClick={() => setStep(1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Quay lại"
                  >
                    <ArrowLeft size={15} />
                  </button>
                )}

                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {submitted ? 'Thiệp đã được tạo' : step === 1 ? 'Chọn mẫu thiệp' : 'Viết lời chúc'}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Sự kiện: {eventTitle || eventTag}</p>
                  {step === 2 && !submitted && selectedTemplate && (
                    <p className="text-xs text-pink-600 mt-0.5">Mẫu: {selectedTemplate.name}</p>
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
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!submitted && step === 1 && (
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3 text-center leading-relaxed">
                  Chọn khung thiệp rồi viết lời chúc. Thiệp của bạn sẽ rơi trên trang chủ sau khi tạo.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templates.map((template, i) => (
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
                          ref={(el) => {
                            thumbRefs.current[i] = el
                          }}
                          width={96}
                          height={136}
                          className="block"
                        />
                      </div>
                      <span className="text-xs text-gray-600 text-center leading-tight px-1">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!submitted && step === 2 && (
              <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-3">
                <div className="rounded-xl border border-pink-100 bg-pink-50/60 px-3 py-2 text-xs text-pink-700 flex items-center gap-2">
                  <Sparkles size={14} />
                  <span>Nên viết ngắn gọn, chân thành, có thể dùng dấu tiếng Việt đầy đủ.</span>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ví dụ: Chúc chị em luôn rạng rỡ, hạnh phúc và thành công mỗi ngày."
                  rows={5}
                  maxLength={MAX_CHARS + 20}
                  autoFocus
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
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
                      background: isEmpty || isOverLimit
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
                    }}
                  >
                    {isSubmitting ? <span className="animate-spin">🌸</span> : <Send size={14} />}
                    Gửi thiệp
                  </button>
                </div>
              </form>
            )}

            {submitted && <SuccessState templateId={selectedTemplateId!} />}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

function SuccessState({ templateId }: { templateId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const template = CARD_TEMPLATES_8_3.find((item) => item.id === templateId) ?? CARD_TEMPLATES_8_3[0]

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
          width={108}
          height={152}
          className="rounded-xl block mx-auto"
          style={{ boxShadow: `0 8px 24px ${template.glowColor}66` }}
        />
      </div>
      <p className="font-semibold text-gray-800">Thiệp đã được gửi thành công</p>
      <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed">
        Thiệp đang rơi trên homepage. Sau khi được duyệt, lời chúc sẽ hiển thị khi người xem mở thiệp.
      </p>
      <style jsx>{`
        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
