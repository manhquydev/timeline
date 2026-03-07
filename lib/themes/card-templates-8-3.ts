'use client'

import {
  roundRect,
  drawRose,
  drawMimosaCluster,
  drawHeart,
  drawCherryBlossom,
  drawCardBack,
  setCanvasFont,
} from './card-canvas-utils'

export interface CardTemplate {
  id: number
  name: string
  glowColor: string
  accentColor: string
  drawFront: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  drawBack: (ctx: CanvasRenderingContext2D, w: number, h: number, greeting?: { message: string; authorName: string }) => void
}

const TEMPLATE_ROSE: CardTemplate = {
  id: 1,
  name: 'Hoa H\u1ed3ng C\u1ed5 \u0110i\u1ec3n',
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

    setCanvasFont(ctx, 38, 800, 'serif')
    ctx.fillStyle = '#c0392b'
    ctx.textAlign = 'center'
    ctx.fillText('Ch\u00fac m\u1eebng 8/3', w / 2, h * 0.54)

    setCanvasFont(ctx, 21, 600, 'sans')
    ctx.fillStyle = '#e8415a'
    ctx.fillText('Ng\u00e0y Qu\u1ed1c t\u1ebf Ph\u1ee5 n\u1eef', w / 2, h * 0.62)
  },
  drawBack: drawCardBack,
}

const TEMPLATE_MIMOSA: CardTemplate = {
  id: 2,
  name: 'Mimosa \u00c1nh V\u00e0ng',
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

    setCanvasFont(ctx, 30, 800, 'serif', 'italic')
    ctx.fillStyle = '#8c6700'
    ctx.textAlign = 'center'
    ctx.fillText('M\u1eebng ng\u00e0y 8/3', w / 2, h * 0.5)

    setCanvasFont(ctx, 22, 600, 'sans')
    ctx.fillStyle = '#b8860b'
    ctx.fillText('R\u1ea1ng r\u1ee1 v\u00e0 h\u1ea1nh ph\u00fac', w / 2, h * 0.58)
  },
  drawBack: drawCardBack,
}

const TEMPLATE_MINIMAL: CardTemplate = {
  id: 3,
  name: 'T\u1ed1i Gi\u1ea3n Hi\u1ec7n \u0110\u1ea1i',
  glowColor: '#ff6b8a',
  accentColor: '#e8415a',
  drawFront(ctx, w, h) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    setCanvasFont(ctx, 140, 900, 'sans')
    ctx.fillStyle = 'rgba(232, 65, 90, 0.08)'
    ctx.textAlign = 'center'
    ctx.fillText('8/3', w / 2, h * 0.62)

    ctx.fillStyle = '#e8415a'
    ctx.fillText('8/3', w / 2, h * 0.59)

    ctx.fillStyle = '#ff6b8a'
    ctx.fillRect(0, 0, 10, h)

    const dotPositions: [number, number, number][] = [[w - 25, 30, 8], [w - 25, 55, 5], [w - 25, 75, 3]]
    for (const [dx, dy, dr] of dotPositions) {
      ctx.beginPath()
      ctx.arc(dx, dy, dr, 0, Math.PI * 2)
      ctx.fillStyle = '#ffb3c1'
      ctx.fill()
    }

    setCanvasFont(ctx, 24, 800, 'sans')
    ctx.fillStyle = '#e8415a'
    ctx.fillText('Ph\u1ee5 n\u1eef l\u00e0 \u0111\u1ec3 y\u00eau th\u01b0\u01a1ng', w / 2, h * 0.74)
  },
  drawBack: drawCardBack,
}

const TEMPLATE_BLOSSOM: CardTemplate = {
  id: 4,
  name: 'Anh \u0110\u00e0o H\u1ed3ng',
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

    setCanvasFont(ctx, 30, 800, 'sans')
    ctx.fillStyle = '#880e4f'
    ctx.textAlign = 'center'
    ctx.fillText('Ng\u00e0y Qu\u1ed1c t\u1ebf Ph\u1ee5 n\u1eef', w / 2, h * 0.52)

    setCanvasFont(ctx, 20, 600, 'sans')
    ctx.fillStyle = '#ad1457'
    ctx.fillText('8 th\u00e1ng 3', w / 2, h * 0.6)
  },
  drawBack: drawCardBack,
}

const TEMPLATE_HEARTS: CardTemplate = {
  id: 5,
  name: 'Tr\u00e1i Tim \u1ea4m \u00c1p',
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

    setCanvasFont(ctx, 26, 800, 'sans')
    ctx.fillStyle = '#c0392b'
    ctx.textAlign = 'center'
    ctx.fillText('G\u1eedi \u0111\u1ebfn ng\u01b0\u1eddi ph\u1ee5 n\u1eef', w / 2, h * 0.62)
    ctx.fillText('\u0111\u1eb7c bi\u1ec7t', w / 2, h * 0.69)
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
