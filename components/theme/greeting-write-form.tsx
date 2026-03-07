'use client'

import { useState } from 'react'
import { PenLine, X, Send } from 'lucide-react'

const MAX_CHARS = 280

export function GreetingWriteForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const remaining = MAX_CHARS - message.length
  const isOverLimit = remaining < 0
  const isEmpty = message.trim().length === 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEmpty || isOverLimit || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/greetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), eventTag: '8-3' }),
      })
      if (res.ok) {
        setSubmitted(true)
        setMessage('')
        setTimeout(() => {
          setSubmitted(false)
          setIsOpen(false)
        }, 2500)
      }
    } catch {
      // Silent fail — will retry next time
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95 md:bottom-8"
        style={{
          background: 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
          boxShadow: '0 4px 20px rgba(255, 77, 109, 0.4)',
        }}
        aria-label="Gửi lời chúc 8/3"
      >
        <PenLine size={16} />
        <span>Gửi lời chúc</span>
      </button>

      {/* Overlay form */}
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
              className="flex items-center justify-between px-5 py-4"
              style={{ background: 'linear-gradient(135deg, #FF4D6D22, #FF85A122)' }}
            >
              <div>
                <h3 className="font-semibold text-gray-800">🌹 Gửi lời chúc 8/3</h3>
                <p className="text-xs text-gray-500 mt-0.5">Lời chúc sẽ xuất hiện trên những tấm thiệp</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            {submitted ? (
              <div className="px-5 py-8 text-center">
                <div className="text-4xl mb-3">💌</div>
                <p className="font-medium text-gray-800">Cảm ơn bạn!</p>
                <p className="text-sm text-gray-500 mt-1">Lời chúc đang chờ duyệt và sẽ sớm xuất hiện.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Viết lời chúc của bạn... 🌸"
                  rows={4}
                  maxLength={MAX_CHARS + 20}
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
                      background: isEmpty || isOverLimit
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #FF4D6D, #FF85A1)',
                    }}
                  >
                    {isSubmitting ? (
                      <span className="animate-spin">🌸</span>
                    ) : (
                      <Send size={14} />
                    )}
                    Gửi
                  </button>
                </div>
              </form>
            )}
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
