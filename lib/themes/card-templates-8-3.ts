'use client'

import {
  roundRect,
  wrapText,
  drawRose,
  drawMimosaCluster,
  drawHeart,
  drawCherryBlossom,
  drawCardBack,
} from './card-canvas-utils'

export interface CardTemplate {
  id: number
  name: string
  glowColor: string
  accentColor: string
  drawFront: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  drawBack: (ctx: CanvasRenderingContext2D, w: number, h: number, greeting?: { message: string; authorName: string }) => void
}

// Template 1: Classic Rose
const TEMPLATE_ROSE: CardTemplate = {
  id: 1,
  name: 'Hoa Hồng Cổ Điển',
  glowColor: '#e8415a',
  accentColor: '#c0392b',
  drawFront(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#fff5f5')
    grad.addColorStop(1, '#ffe0e6')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    drawRose(ctx, w * 0.22, h * 0.22, 55)
    drawRose(ctx, w * 0.82, h * 0.8, 30)

    ctx.strokeStyle = '#e8415a'
    ctx.lineWidth = 6
    roundRect(ctx, 8, 8, w - 16, h - 16, 16)
    ctx.stroke()

    ctx.font = 'bold 38px Georgia, serif'
    ctx.fillStyle = '#c0392b'
    ctx.textAlign = 'center'
    ctx.fillText('Chúc mừng 8/3', w / 2, h * 0.54)

    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#e8415a'
    ctx.fillText('💕 Ngày Quốc tế Phụ nữ', w / 2, h * 0.62)
  },
  drawBack: drawCardBack,
}

// Template 2: Mimosa Gold
const TEMPLATE_MIMOSA: CardTemplate = {
  id: 2,
  name: 'Hoa Mimosa Vàng',
  glowColor: '#f0a500',
  accentColor: '#b8860b',
  drawFront(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w)
    grad.addColorStop(0, '#fffef0')
    grad.addColorStop(1, '#fff3cd')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    drawMimosaCluster(ctx, w * 0.15, h * 0.18)
    drawMimosaCluster(ctx, w * 0.78, h * 0.72)

    ctx.strokeStyle = '#f0a500'
    ctx.lineWidth = 4
    ctx.setLineDash([12, 6])
    roundRect(ctx, 12, 12, w - 24, h - 24, 12)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.font = 'italic bold 28px Georgia, serif'
    ctx.fillStyle = '#b8860b'
    ctx.textAlign = 'center'
    ctx.fillText('Bonne Fête des Femmes', w / 2, h * 0.5)

    ctx.font = '22px sans-serif'
    ctx.fillStyle = '#c8950a'
    ctx.fillText('🌸 8 tháng 3 🌸', w / 2, h * 0.58)
  },
  drawBack: drawCardBack,
}

// Template 3: Bold Typography
const TEMPLATE_MINIMAL: CardTemplate = {
  id: 3,
  name: 'Chữ Tối Giản',
  glowColor: '#ff6b8a',
  accentColor: '#e8415a',
  drawFront(ctx, w, h) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // Ghost 8/3 background
    ctx.font = 'bold 140px Arial Black, sans-serif'
    ctx.fillStyle = 'rgba(232, 65, 90, 0.06)'
    ctx.textAlign = 'center'
    ctx.fillText('8/3', w / 2, h * 0.62)

    // Solid 8/3
    ctx.fillStyle = '#e8415a'
    ctx.fillText('8/3', w / 2, h * 0.59)

    // Left accent bar
    ctx.fillStyle = '#ff6b8a'
    ctx.fillRect(0, 0, 10, h)

    // Dots
    const dotPositions: [number, number, number][] = [[w - 25, 30, 8], [w - 25, 55, 5], [w - 25, 75, 3]]
    for (const [dx, dy, dr] of dotPositions) {
      ctx.beginPath()
      ctx.arc(dx, dy, dr, 0, Math.PI * 2)
      ctx.fillStyle = '#ffb3c1'
      ctx.fill()
    }

    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = '#e8415a'
    ctx.fillText('Phụ nữ tuyệt vời ❤️', w / 2, h * 0.74)
  },
  drawBack: drawCardBack,
}

// Template 4: Cherry Blossom
const TEMPLATE_BLOSSOM: CardTemplate = {
  id: 4,
  name: 'Hoa Anh Đào',
  glowColor: '#ff8fa3',
  accentColor: '#880e4f',
  drawFront(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#fce4ec')
    grad.addColorStop(1, '#f8bbd0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const blossomPositions: [number, number, number][] = [
      [w * 0.1, h * 0.1, 28], [w * 0.88, h * 0.14, 22],
      [w * 0.2, h * 0.72, 32], [w * 0.78, h * 0.78, 25],
      [w * 0.5, h * 0.38, 35],
    ]
    for (const [bx, by, bs] of blossomPositions) {
      drawCherryBlossom(ctx, bx, by, bs)
    }

    ctx.font = 'bold 30px sans-serif'
    ctx.fillStyle = '#880e4f'
    ctx.textAlign = 'center'
    ctx.fillText("Happy Women's Day 🌸", w / 2, h * 0.52)

    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#ad1457'
    ctx.fillText('8 tháng 3 🌷', w / 2, h * 0.6)
  },
  drawBack: drawCardBack,
}

// Template 5: Hearts Cream
const TEMPLATE_HEARTS: CardTemplate = {
  id: 5,
  name: 'Trái Tim Ấm Áp',
  glowColor: '#ff4757',
  accentColor: '#c0392b',
  drawFront(ctx, w, h) {
    ctx.fillStyle = '#fff8f0'
    ctx.fillRect(0, 0, w, h)

    const hearts: [number, number, number, string][] = [
      [w * 0.15, h * 0.14, 38, '#ff4757'],
      [w * 0.82, h * 0.1, 26, '#ff6b8a'],
      [w * 0.5, h * 0.32, 55, '#e8415a'],
      [w * 0.1, h * 0.62, 28, '#ffb3c1'],
      [w * 0.88, h * 0.64, 32, '#ff4757'],
      [w * 0.38, h * 0.78, 18, '#ff8fa3'],
      [w * 0.72, h * 0.82, 22, '#e8415a'],
    ]
    for (const [hx, hy, hs, hc] of hearts) {
      drawHeart(ctx, hx, hy, hs, hc)
    }

    ctx.font = 'bold 26px Georgia, serif'
    ctx.fillStyle = '#c0392b'
    ctx.textAlign = 'center'
    ctx.fillText('Gửi đến người', w / 2, h * 0.62)
    ctx.fillText('phụ nữ đặc biệt 💖', w / 2, h * 0.7)
  },
  drawBack: drawCardBack,
}

export const CARD_TEMPLATES_8_3: CardTemplate[] = [
  TEMPLATE_ROSE,
  TEMPLATE_MIMOSA,
  TEMPLATE_MINIMAL,
  TEMPLATE_BLOSSOM,
  TEMPLATE_HEARTS,
]

export function getRandomTemplate(): CardTemplate {
  return CARD_TEMPLATES_8_3[Math.floor(Math.random() * CARD_TEMPLATES_8_3.length)]
}
