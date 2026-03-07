# Phase 5: Card Frame Templates

**Priority:** Medium  
**Status:** ⬜ Not Started  
**Depends on:** Phase 2 (Three.js texture system)

---

## Overview

5 mẫu thiệp 8/3 được render bằng Canvas API → làm texture cho Three.js PlaneGeometry.  
Mỗi mẫu có giao diện riêng, đều mang không khí ngày 8/3 (hoa hồng, mimosa, trái tim...).

---

## Template System Architecture

### File: `lib/themes/card-templates-8-3.ts`

```typescript
export interface CardTemplate {
  id: number
  name: string
  drawFront: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  drawBack: (ctx: CanvasRenderingContext2D, w: number, h: number, greeting?: { message: string; authorName: string }) => void
  glowColor: string   // Three.js hover glow color
  accentColor: string // dominant color for UI
}

export const CARD_TEMPLATES_8_3: CardTemplate[] = [
  TEMPLATE_ROSE,
  TEMPLATE_MIMOSA,
  TEMPLATE_MINIMAL,
  TEMPLATE_BLOSSOM,
  TEMPLATE_HEARTS,
]
```

### Canvas Rendering Utils: `lib/themes/card-canvas-utils.ts`

```typescript
export function createCardTexture(
  template: CardTemplate,
  side: 'front' | 'back',
  greeting?: { message: string; authorName: string }
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 720
  const ctx = canvas.getContext('2d')!
  
  if (side === 'front') template.drawFront(ctx, 512, 720)
  else template.drawBack(ctx, 512, 720, greeting)
  
  return new THREE.CanvasTexture(canvas)
}
```

---

## 5 Template Designs

### Template 1: Classic Rose (Hoa hồng cổ điển)

```
Background: gradient trắng → hồng nhạt (trái → phải)
Góc trên trái: bông hồng đỏ lớn (canvas arc/path)
Góc dưới phải: cành lá xanh + nụ hồng nhỏ
Viền: border đỏ hồng mỏng với góc bo tròn
Text vùng giữa: "Chúc mừng 8/3" bằng font cursive trắng
```

```typescript
drawFront: (ctx, w, h) => {
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#fff5f5')
  grad.addColorStop(1, '#ffe0e6')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  
  // Rose petals using bezier curves
  drawRose(ctx, w * 0.2, h * 0.25, 80)   // large rose top-left
  drawRose(ctx, w * 0.85, h * 0.8, 40)   // small rose bottom-right
  
  // Decorative border
  ctx.strokeStyle = '#e8415a'
  ctx.lineWidth = 6
  roundRect(ctx, 8, 8, w-16, h-16, 16)
  ctx.stroke()
  
  // Title text
  ctx.font = 'bold 36px "Dancing Script", cursive'
  ctx.fillStyle = '#c0392b'
  ctx.textAlign = 'center'
  ctx.fillText('Chúc mừng 8/3', w/2, h*0.52)
  ctx.font = '20px sans-serif'
  ctx.fillStyle = '#e8415a'
  ctx.fillText('💕 Ngày Quốc tế Phụ nữ', w/2, h*0.58)
}
```

---

### Template 2: Mimosa Gold (Hoa mimosa vàng)

```
Background: gradient trắng → vàng nhạt
Hoa mimosa: cluster các hình tròn nhỏ vàng + xanh lá
Viền: vàng đậm, style đơn giản
Caption: tiếng Pháp "Bonne Fête des Femmes" italic
```

```typescript
drawFront: (ctx, w, h) => {
  // Warm white-yellow gradient
  const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w)
  grad.addColorStop(0, '#fffef0')
  grad.addColorStop(1, '#fff3cd')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  
  // Mimosa flower clusters
  drawMimosaCluster(ctx, w * 0.15, h * 0.2)  // top-left
  drawMimosaCluster(ctx, w * 0.8, h * 0.75)  // bottom-right
  
  // Gold border
  ctx.strokeStyle = '#f0a500'
  ctx.lineWidth = 5
  ctx.setLineDash([10, 5])
  ctx.strokeRect(12, 12, w-24, h-24)
  ctx.setLineDash([])
  
  // Text
  ctx.font = 'italic 28px Georgia'
  ctx.fillStyle = '#b8860b'
  ctx.textAlign = 'center'
  ctx.fillText('Bonne Fête des Femmes', w/2, h*0.5)
  ctx.font = '22px sans-serif'
  ctx.fillStyle = '#c8950a'
  ctx.fillText('🌸 8 tháng 3', w/2, h*0.56)
}
```

---

### Template 3: Minimalist Typography (Tối giản chữ lớn)

```
Background: trắng tinh
"8/3" chữ số rất lớn, màu đỏ hồng, font bold
Viền trái: solid line màu hồng
Vài chấm tròn nhỏ trang trí
```

```typescript
drawFront: (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
  
  // Large "8/3" text
  ctx.font = 'bold 160px Arial Black'
  ctx.fillStyle = 'rgba(232, 65, 90, 0.08)' // ghost text bg
  ctx.textAlign = 'center'
  ctx.fillText('8/3', w/2, h * 0.6)
  
  ctx.fillStyle = '#e8415a'
  ctx.fillText('8/3', w/2, h * 0.58)
  
  // Left accent line
  ctx.fillStyle = '#ff6b8a'
  ctx.fillRect(0, 0, 8, h)
  
  // Dot decorations
  [30, 60, 90].forEach((y, i) => {
    ctx.beginPath()
    ctx.arc(w - 30, y * 3, 6 - i, 0, Math.PI * 2)
    ctx.fillStyle = '#ffb3c1'
    ctx.fill()
  })
  
  ctx.font = '28px sans-serif'
  ctx.fillStyle = '#e8415a'
  ctx.fillText('Phụ nữ tuyệt vời ❤️', w/2, h * 0.72)
}
```

---

### Template 4: Cherry Blossom (Hoa anh đào)

```
Background: gradient hồng đào nhạt
Các cánh hoa anh đào rải rác (vẽ bằng path)
Full-bleed design, không có border
Phong cách Nhật Bản, nhẹ nhàng
```

```typescript
drawFront: (ctx, w, h) => {
  // Soft pink gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#fce4ec')
  grad.addColorStop(1, '#f8bbd9')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  
  // Scattered cherry blossom petals
  const positions = [[w*0.1,h*0.1],[w*0.9,h*0.15],[w*0.2,h*0.7],[w*0.75,h*0.8],[w*0.5,h*0.4]]
  positions.forEach(([x, y]) => drawCherryBlossom(ctx, x, y, 30 + Math.random() * 20))
  
  ctx.font = 'bold 32px sans-serif'
  ctx.fillStyle = '#880e4f'
  ctx.textAlign = 'center'
  ctx.fillText('Happy Women\'s Day 🌸', w/2, h * 0.5)
}
```

---

### Template 5: Hearts Cream (Trái tim ấm áp)

```
Background: kem vàng ấm
Nhiều trái tim nhỏ lớn, màu đỏ và hồng
Vibe: yêu thương, ấm áp
Tên: "Gửi đến người phụ nữ đặc biệt"
```

```typescript
drawFront: (ctx, w, h) => {
  ctx.fillStyle = '#fff8f0'; ctx.fillRect(0, 0, w, h)
  
  // Hearts of various sizes
  const hearts = [
    [w*0.15, h*0.15, 40, '#ff4757'],
    [w*0.8, h*0.1, 25, '#ff6b8a'],
    [w*0.5, h*0.35, 60, '#e8415a'],
    [w*0.1, h*0.6, 30, '#ffb3c1'],
    [w*0.9, h*0.65, 35, '#ff4757'],
  ]
  hearts.forEach(([x, y, size, color]) => drawHeart(ctx, x, y, size, color))
  
  ctx.font = 'bold 26px Georgia'
  ctx.fillStyle = '#c0392b'
  ctx.textAlign = 'center'
  ctx.fillText('Gửi đến người', w/2, h * 0.62)
  ctx.fillText('phụ nữ đặc biệt 💖', w/2, h * 0.68)
}
```

---

## Card Back Design (Common)

Tất cả templates dùng chung **card back** khi mở ra — hiển thị lời chúc:

```typescript
drawBack: (ctx, w, h, greeting) => {
  // Subtle gradient bg
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#fff5f8')
  grad.addColorStop(1, '#ffe8ef')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
  
  // Decorative line top
  ctx.strokeStyle = '#e8415a'
  ctx.lineWidth = 3
  ctx.moveTo(40, 60); ctx.lineTo(w-40, 60)
  ctx.stroke()
  
  // Greeting message (word-wrapped)
  ctx.font = '24px Georgia'
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  wrapText(ctx, greeting?.message ?? '💕', w/2, h * 0.4, w - 80, 32)
  
  // Author name
  ctx.font = 'italic 18px sans-serif'
  ctx.fillStyle = '#e8415a'
  ctx.fillText(`— ${greeting?.authorName ?? 'Ẩn danh'}`, w/2, h * 0.78)
  
  // Bottom decoration
  ctx.font = '24px sans-serif'
  ctx.fillText('🌹 8/3 🌹', w/2, h * 0.88)
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/themes/card-templates-8-3.ts` | 5 template objects với drawFront/drawBack |
| `lib/themes/card-canvas-utils.ts` | createCardTexture(), drawRose(), drawHeart(), wrapText(), etc. |

---

## Success Criteria
- [ ] 5 templates render đúng trên canvas 512×720
- [ ] Back side hiển thị lời chúc + tên tác giả
- [ ] Text wrap hoạt động với lời chúc dài
- [ ] Không bị vỡ font (fallback fonts sẵn trên browser)
- [ ] Texture rõ nét trên Three.js (no blurry)
