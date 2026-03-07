'use client'

// Helper: draw a rounded rectangle path
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Helper: word-wrap text centered
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ')
  let line = ''
  let y = startY
  for (const word of words) {
    const testLine = line ? line + ' ' + word : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = word
      y += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, y)
  return y + lineHeight
}

// Helper: draw a simple rose shape using bezier curves
export function drawRose(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number
) {
  const petalCount = 5
  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < petalCount; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / petalCount)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.5,
      -size * 0.3, -size,
      0, -size
    )
    ctx.bezierCurveTo(
      size * 0.3, -size,
      size * 0.5, -size * 0.5,
      0, 0
    )
    ctx.fillStyle = `rgba(220, 50, 80, 0.85)`
    ctx.fill()
    ctx.restore()
  }
  // Center circle
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = '#b22222'
  ctx.fill()
  ctx.restore()
}

// Helper: draw mimosa flower cluster (small circles)
export function drawMimosaCluster(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number
) {
  const offsets = [
    [0, 0, 8], [-14, -10, 6], [14, -8, 6],
    [-8, 14, 5], [10, 12, 7], [-18, 4, 4],
    [18, 4, 4], [0, -18, 5],
  ]
  for (const [dx, dy, r] of offsets) {
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2)
    ctx.fillStyle = '#f4c430'
    ctx.fill()
  }
  // Stem
  ctx.beginPath()
  ctx.moveTo(cx, cy + 20)
  ctx.lineTo(cx, cy + 50)
  ctx.strokeStyle = '#5a8a00'
  ctx.lineWidth = 2
  ctx.stroke()
  // Leaves
  ctx.beginPath()
  ctx.ellipse(cx + 10, cy + 35, 12, 5, -0.5, 0, Math.PI * 2)
  ctx.fillStyle = '#6ab04c'
  ctx.fill()
}

// Helper: draw a heart shape
export function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(size / 30, size / 30)
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.bezierCurveTo(-15, -25, -30, -10, -30, 0)
  ctx.bezierCurveTo(-30, 15, 0, 30, 0, 30)
  ctx.bezierCurveTo(0, 30, 30, 15, 30, 0)
  ctx.bezierCurveTo(30, -10, 15, -25, 0, -10)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

// Helper: draw a 5-petal cherry blossom
export function drawCherryBlossom(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number
) {
  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -size * 0.4, size * 0.25, size * 0.45, 0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 182, 193, 0.8)`
    ctx.fill()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = '#ffd700'
  ctx.fill()
  ctx.restore()
}

// Shared card back drawing
export function drawCardBack(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  greeting?: { message: string; authorName: string }
) {
  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#fff5f8')
  grad.addColorStop(1, '#ffe8ef')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Border
  ctx.strokeStyle = '#e8415a'
  ctx.lineWidth = 4
  roundRect(ctx, 8, 8, w - 16, h - 16, 16)
  ctx.stroke()

  // Top decoration line
  ctx.beginPath()
  ctx.moveTo(40, 70)
  ctx.lineTo(w - 40, 70)
  ctx.strokeStyle = 'rgba(232, 65, 90, 0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Heart icon top center
  ctx.font = '28px serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e8415a'
  ctx.fillText('💌', w / 2, 55)

  const message = greeting?.message ?? 'Chúc mừng ngày Quốc tế Phụ nữ 8/3! 🌹'
  const authorName = greeting?.authorName ?? 'Team Timeline'

  // Message
  ctx.font = '22px Georgia, serif'
  ctx.fillStyle = '#3a1a2a'
  ctx.textAlign = 'center'
  const endY = wrapText(ctx, `"${message}"`, w / 2, h * 0.35, w - 80, 30)

  // Author
  ctx.font = 'italic 18px Georgia, serif'
  ctx.fillStyle = '#e8415a'
  ctx.fillText(`— ${authorName}`, w / 2, Math.min(endY + 20, h * 0.8))

  // Bottom
  ctx.font = '22px serif'
  ctx.fillStyle = '#d63031'
  ctx.fillText('🌹 8/3 🌹', w / 2, h * 0.9)
}
