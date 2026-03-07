'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Image as ImageIcon, RotateCcw, X } from 'lucide-react'
import Image from 'next/image'

import { CARD_TEMPLATES_8_3 } from '@/lib/themes/card-templates-8-3'

interface GreetingPayload {
  id: string | null
  message: string
  authorName: string
  source?: 'post_wish' | 'greeting' | 'empty_event'
  deepLink?: string | null
  mediaPreviewUrl?: string | null
}

interface CardOpenModalProps {
  isOpen: boolean
  templateId: number | null
  eventTag: string
  eventId?: string
  eventSlug?: string
  eventTitle?: string
  onClose: () => void
  preloadedGreeting?: { message: string; authorName: string } | null
}

function getSourceLabel(source?: GreetingPayload['source']) {
  if (source === 'post_wish') return 'Từ bài đăng sự kiện'
  if (source === 'greeting') return 'Từ thiệp đã duyệt'
  return 'Sự kiện'
}

export function CardOpenModal({
  isOpen,
  templateId,
  eventTag,
  eventId,
  eventSlug,
  eventTitle,
  onClose,
  preloadedGreeting,
}: CardOpenModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [greeting, setGreeting] = useState<GreetingPayload | null>(null)
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setPhase('opening')
    setIsFlipped(false)

    if (preloadedGreeting) {
      setGreeting({
        id: null,
        message: preloadedGreeting.message,
        authorName: preloadedGreeting.authorName,
        source: 'greeting',
        deepLink: eventSlug ? `/events/${encodeURIComponent(eventSlug)}` : null,
      })
      setTimeout(() => setPhase('open'), 420)
      return
    }

    setGreeting(null)
    const params = new URLSearchParams({ tag: eventTag })
    if (eventId) params.set('eventId', eventId)
    if (eventSlug) params.set('eventSlug', eventSlug)

    fetch(`/api/greetings/random?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => setGreeting(data.greeting ?? null))
      .catch(() => setGreeting(null))
      .finally(() => {
        setTimeout(() => setPhase('open'), 500)
      })
  }, [isOpen, preloadedGreeting, eventTag, eventId, eventSlug])

  useEffect(() => {
    if (phase !== 'open' || !canvasRef.current || templateId === null) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const template = CARD_TEMPLATES_8_3.find((item) => item.id === templateId) ?? CARD_TEMPLATES_8_3[0]
    template.drawFront(ctx, canvas.width, canvas.height)
  }, [phase, templateId])

  useEffect(() => {
    if (!isOpen) {
      setIsFlipped(false)
      setTimeout(() => setPhase('closed'), 240)
    }
  }, [isOpen])

  if (!isOpen && phase === 'closed') return null

  const template = templateId !== null
    ? (CARD_TEMPLATES_8_3.find((item) => item.id === templateId) ?? CARD_TEMPLATES_8_3[0])
    : CARD_TEMPLATES_8_3[0]

  const hasGreeting = Boolean(
    greeting?.source !== 'empty_event' &&
    greeting?.message &&
    greeting.message.trim().length > 0
  )

  return (
    <AnimatePresence>
      {(isOpen || phase !== 'closed') && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: 'rgba(11, 18, 33, 0.68)' }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[420px]"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: isOpen ? 0 : 16, scale: isOpen ? 1 : 0.96, opacity: isOpen ? 1 : 0 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-20 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>

            <div className="rounded-3xl border border-white/70 bg-white/92 shadow-2xl backdrop-blur-md p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-pink-500 font-semibold">Thiệp sự kiện</p>
                  <p className="text-sm font-semibold text-gray-800">{eventTitle || eventTag}</p>
                </div>
                {greeting?.source && (
                  <span className="text-[11px] rounded-full bg-pink-50 text-pink-600 px-2.5 py-1 border border-pink-100">
                    {getSourceLabel(greeting.source)}
                  </span>
                )}
              </div>

              {phase === 'opening' && (
                <motion.div
                  className="relative mx-auto mb-2 w-[300px] h-[190px]"
                  initial={{ rotateX: 12, scale: 0.92, opacity: 0.7 }}
                  animate={{ rotateX: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.32 }}
                  style={{ perspective: 900 }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 border border-pink-200 shadow-lg" />
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[52%] rounded-t-2xl origin-top"
                    style={{ background: 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)' }}
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: -168 }}
                    transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-pink-600 font-medium">
                    Đang mở thiệp...
                  </div>
                </motion.div>
              )}

              {phase === 'open' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <div className="mx-auto w-[min(88vw,360px)]" style={{ perspective: '1200px' }}>
                    <div
                      className="relative aspect-[5/7] transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-xl"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      >
                        <canvas
                          ref={canvasRef}
                          width={360}
                          height={504}
                          className="block w-full h-full"
                          style={{ boxShadow: `0 18px 42px ${template.glowColor}44, 0 0 20px ${template.glowColor}33` }}
                        />
                        <button
                          onClick={() => setIsFlipped(true)}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-xs font-medium text-pink-600 border border-pink-100 shadow"
                        >
                          Lật mặt sau
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 bg-gradient-to-b from-white to-rose-50 shadow-xl"
                        style={{
                          transform: 'rotateY(180deg)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="h-full flex flex-col p-4">
                          <div className="flex-1 overflow-y-auto pr-1">
                            {hasGreeting ? (
                              <>
                                <p className="text-[13px] leading-relaxed text-gray-700 italic whitespace-pre-wrap">
                                  &ldquo;{greeting?.message}&rdquo;
                                </p>
                                <p className="text-xs text-gray-500 mt-2">- {greeting?.authorName}</p>
                                {greeting?.mediaPreviewUrl && (
                                  <div className="mt-3 overflow-hidden rounded-xl border border-pink-100">
                                    <Image
                                      src={greeting.mediaPreviewUrl}
                                      alt="Ảnh bài đăng liên kết"
                                      width={720}
                                      height={320}
                                      unoptimized
                                      className="w-full h-24 object-cover"
                                    />
                                  </div>
                                )}
                                {greeting?.mediaPreviewUrl && (
                                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                                    <ImageIcon size={12} />
                                    <span>Bài đăng có ảnh/video</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="h-full flex items-center justify-center text-center">
                                <p className="text-sm text-gray-500">Chưa có lời chúc được duyệt cho sự kiện này.</p>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setIsFlipped(false)}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white"
                            >
                              <RotateCcw size={12} />
                              Mặt trước
                            </button>

                            {greeting?.deepLink && (
                              <button
                                onClick={() => {
                                  window.location.href = greeting.deepLink as string
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
                              >
                                Mở sự kiện liên kết
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
