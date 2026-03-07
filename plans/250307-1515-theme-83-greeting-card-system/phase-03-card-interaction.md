# Phase 3: Card Click & Open Animation

**Priority:** High  
**Status:** ⬜ Not Started  
**Depends on:** Phase 2 (onCardClick callback), Phase 4 (greeting API)

---

## Overview

Khi user click vào thiệp rơi → modal mở với animation "mở phong bì" hoặc "lật thiệp" 3D.  
Thiệp hiển thị **khung cố định** (từ card template) và **lời chúc ngẫu nhiên** từ DB.

---

## UX Flow

```
User click thiệp rơi (Three.js)
  → FallingCards gọi onCardClick(templateId)
  → CardOpenModal state = open
  → Animation: phong bì nhỏ scale up từ vị trí click
  → Phong bì "mở nắp" (3D flip top half)
  → Thiệp trượt ra từ phong bì (translateY animation)
  → Thiệp fully visible với:
      ├── Khung thiệp (fixed template design)
      └── Lời chúc (từ API /api/greetings/random)
  → User có thể đọc → close
  → Tùy chọn: "Viết lời chúc của bạn" → link đến greeting form
```

---

## Animation Design (CSS + Framer Motion)

Không dùng Three.js cho modal — dùng CSS transforms để đơn giản và dễ maintain.

```
Phase 1 (0-300ms):  envelope scale từ 0.1 → 1, opacity 0 → 1
Phase 2 (300-600ms): envelope flap mở (rotate3d cho nắp phong bì)
Phase 3 (500-900ms): thiệp slide ra từ phong bì (translateY -100px)
Phase 4 (800ms+):   thiệp fully visible, lời chúc fade in
```

### Envelope CSS Animation

```css
/* Envelope container */
.envelope {
  position: relative;
  width: 320px;
  height: 220px;
}

/* Envelope flap (top triangle) */
.envelope-flap {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  transform-origin: top center;
  transform-style: preserve-3d;
  /* Giấy gấp */
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: linear-gradient(to bottom, #ff6b8a, #ff4d6d);
  transition: transform 0.4s ease-in-out;
}

.envelope-flap.open {
  transform: rotateX(-160deg);  /* Mở nắp ra phía sau */
}

/* Card slides out */
.greeting-card {
  position: absolute;
  bottom: 10px; left: 10px; right: 10px;
  height: calc(100% - 20px);
  transition: transform 0.5s ease-out 0.4s;
}

.greeting-card.revealed {
  transform: translateY(-120%);
}
```

---

## Component Structure

### `components/theme/card-open-modal.tsx`

```typescript
interface CardOpenModalProps {
  isOpen: boolean
  templateId: number | null
  onClose: () => void
}

export function CardOpenModal({ isOpen, templateId, onClose }: CardOpenModalProps) {
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'card'>('envelope')
  const [greeting, setGreeting] = useState<{ text: string; authorName: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || templateId === null) return
    
    // Fetch random greeting
    setIsLoading(true)
    fetch('/api/greetings/random')
      .then(r => r.json())
      .then(d => setGreeting(d.greeting))
      .finally(() => setIsLoading(false))
    
    // Sequence animation
    setPhase('envelope')
    setTimeout(() => setPhase('opening'), 300)
    setTimeout(() => setPhase('card'), 800)
  }, [isOpen, templateId])

  // ...render envelope → card animation
}
```

### State Machine
```
closed → opening[scale-in envelope] → flap-open → card-reveal → visible → closed
```

---

## Touch Support (Mobile)
- Click = tap anywhere on falling card
- Modal dismissible bằng tap ngoài
- Card lớn hơn trên mobile (90vw)

---

## Files to Create

| File | Action |
|------|--------|
| `components/theme/card-open-modal.tsx` | CREATE — phong bì + thiệp animation modal |
| `components/theme/card-open-modal-trigger.tsx` | CREATE — connector giữa FallingCards và Modal |

---

## Integration with FallingCards

```tsx
// In parent component or layout:
const [openCard, setOpenCard] = useState<{ templateId: number } | null>(null)

<FallingCards onCardClick={(tid) => setOpenCard({ templateId: tid })} />
<CardOpenModal
  isOpen={!!openCard}
  templateId={openCard?.templateId ?? null}
  onClose={() => setOpenCard(null)}
/>
```

---

## Success Criteria
- [ ] Animation mở phong bì mượt, không giật
- [ ] Lời chúc hiển thị sau khi thiệp ra
- [ ] Tên tác giả hiển thị nhỏ bên dưới
- [ ] "Loading..." state khi fetch greeting
- [ ] Nếu không có greeting → hiển thị lời chúc mặc định
- [ ] Mobile friendly
