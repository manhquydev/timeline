'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/themes/theme-provider'

/**
 * FallingPetals - Hiệu ứng hoa rơi cho theme đặc biệt
 *
 * Component này tạo hiệu ứng hoa rơi (petals/confetti) khi theme 20/10 được kích hoạt
 *
 * Features:
 * - Tự động hiển thị khi theme có enableParticles = true
 * - Sử dụng CSS animation để tối ưu performance
 * - Responsive: ít particles hơn trên mobile
 * - Tôn trọng prefers-reduced-motion cho accessibility
 * - Màu particles lấy từ theme.effects.particleColor
 */

interface Petal {
  id: number
  left: number // vị trí X (%)
  animationDuration: number // thời gian rơi (s)
  animationDelay: number // delay trước khi bắt đầu (s)
  size: number // kích thước (px)
  rotation: number // góc xoay ban đầu (deg)
  swayAmount: number // độ lung lay ngang (px)
  shape: 'heart' | 'circle' | 'petal' // hình dạng
}

export function FallingPetals() {
  const { theme } = useTheme()
  const [petals, setPetals] = useState<Petal[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Chỉ hiển thị khi theme có enableParticles
    if (!theme || !theme.effects.enableParticles) {
      setIsVisible(false)
      return
    }

    // Không hiển thị cho theme default
    if (theme.name === 'default') {
      setIsVisible(false)
      return
    }

    // Kiểm tra user preference về motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(false)
      return
    }

    // Số lượng petals dựa vào kích thước màn hình
    const isMobile = window.innerWidth < 768
    const petalCount = isMobile ? 12 : 20

    // Tạo mảng petals với properties ngẫu nhiên
    const newPetals: Petal[] = Array.from({ length: petalCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 8, // 8-16s
      animationDelay: Math.random() * 10, // 0-10s delay
      size: 8 + Math.random() * 12, // 8-20px
      rotation: Math.random() * 360,
      swayAmount: 30 + Math.random() * 50, // 30-80px sway
      shape: ['heart', 'circle', 'petal'][Math.floor(Math.random() * 3)] as Petal['shape'],
    }))

    setPetals(newPetals)
    setIsVisible(true)

    // Cleanup function
    return () => {
      setIsVisible(false)
      setPetals([])
    }
  }, [theme])

  if (!isVisible || petals.length === 0) return null

  const particleColor = theme?.effects.particleColor || '#FFB6D9'

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-[-20px] animate-fall-and-sway"
          style={{
            left: `${petal.left}%`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.animationDelay}s`,
            '--sway-amount': `${petal.swayAmount}px`,
          } as React.CSSProperties}
        >
          {/* Petal shape */}
          <div
            className="animate-spin-slow"
            style={{
              width: `${petal.size}px`,
              height: `${petal.size}px`,
              transform: `rotate(${petal.rotation}deg)`,
              animationDuration: `${petal.animationDuration * 0.6}s`,
            }}
          >
            {petal.shape === 'heart' && (
              <HeartShape color={particleColor} size={petal.size} />
            )}
            {petal.shape === 'circle' && (
              <CircleShape color={particleColor} size={petal.size} />
            )}
            {petal.shape === 'petal' && (
              <PetalShape color={particleColor} size={petal.size} />
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fall-and-sway {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 50px)) translateX(var(--sway-amount));
            opacity: 0;
          }
        }

        .animate-fall-and-sway {
          animation: fall-and-sway linear infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }

        /* Tối ưu cho mobile */
        @media (max-width: 768px) {
          .animate-fall-and-sway {
            animation-duration: 6s !important;
          }
        }

        /* Tôn trọng prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fall-and-sway,
          .animate-spin-slow {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

// Heart shape component
function HeartShape({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
      }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

// Circle shape component
function CircleShape({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    />
  )
}

// Petal shape component (oval rotated)
function PetalShape({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        width: size * 0.6,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: 'rotate(45deg)',
      }}
    />
  )
}
