# Event Notification Popup System

## 📋 Tổng quan

Hệ thống popup thông báo sự kiện đặc biệt với thiết kế **flip card** 3D đẹp mắt, mobile-first, chỉ hiển thị **1 lần** cho mỗi người dùng.

### ✨ Tính năng nổi bật

- 🎴 **3D Flip Card Animation** - Thiết kế hiện đại với smooth animation
- 📱 **Mobile-First Design** - Tối ưu cho trải nghiệm mobile
- 💾 **Smart Tracking** - LocalStorage để nhớ người dùng đã xem
- ⏰ **Event-Based Scheduling** - Tự động hiển thị theo lịch sự kiện
- 🎨 **Beautiful Design** - Theo trends 2025: Minimalist, Gradients, Floral patterns
- ♿ **Accessibility** - Support reduced motion, touch-friendly
- 🌐 **Vietnamese Content** - Nội dung tiếng Việt hoàn chỉnh

---

## 🏗️ Kiến trúc

### **File Structure**

```
├── components/event-notifications/
│   ├── event-notification-popup.tsx  # Main popup component
│   ├── flip-card.tsx                  # 3D flip card với front/back
│   └── index.ts                       # Exports
├── lib/
│   ├── stores/event-popup-store.ts    # Zustand state management
│   └── config/event-notifications.ts  # Event configs
└── app/
    ├── layout.tsx                     # Integration point
    └── test-popup/page.tsx            # Test/preview page
```

### **Component Hierarchy**

```
EventNotificationPopup (Main)
  ├── Backdrop (blur overlay)
  ├── Close Button (X)
  └── FlipCard
      ├── FlipCardFront (Call-to-action)
      └── FlipCardBack (Greeting card)
```

---

## 🚀 Cách sử dụng

### **1. Preview/Test Popup**

Truy cập: `http://localhost:3000/test-popup`

- ✅ Xem thiết kế real-time
- ✅ Test flip animation
- ✅ Test responsive trên mobile
- ✅ Reset localStorage để xem lại

**⚠️ CHÚ Ý:** Xóa hoặc bảo vệ route `/test-popup` trước khi deploy production!

### **2. Tạo sự kiện mới**

Edit file: `lib/config/event-notifications.ts`

```typescript
export const myEventConfig: EventNotificationConfig = {
  id: 'my-event-2025',
  enabled: true,
  startDate: new Date('2025-12-20T00:00:00'),
  endDate: new Date('2025-12-25T23:59:59'),
  delayMs: 2000,

  content: {
    front: {
      title: '🎄 Sự kiện Giáng Sinh',
      subtitle: 'Nhấn để khám phá',
      icon: '🎁',
      ctaText: 'Mở quà',
    },
    back: {
      title: 'Chúc Mừng Giáng Sinh',
      message: 'Chúc bạn có một mùa lễ ấm áp và hạnh phúc!',
      greeting: 'Merry Christmas & Happy New Year! 🎅',
      decorations: ['🎄', '⭐', '🎁', '❄️', '🔔', '🎅'],
    },
  },

  theme: {
    gradient: 'gradient-2', // Blue gradient
    accentColor: 'hsl(var(--gradient-2-start))',
  },
}

// Add to getActiveEventNotification()
export function getActiveEventNotification() {
  const now = new Date()

  // Check My Event
  if (
    myEventConfig.enabled &&
    now >= myEventConfig.startDate &&
    now <= myEventConfig.endDate
  ) {
    return myEventConfig
  }

  // ... other events
  return null
}
```

### **3. Tắt/Bật sự kiện**

```typescript
export const womensDay2025Config: EventNotificationConfig = {
  id: 'womens-day-2025',
  enabled: false, // ← Set false để tắt
  // ...
}
```

---

## 🎨 Customization

### **Thay đổi theme colors**

Chọn gradient có sẵn trong `globals.css`:

```typescript
theme: {
  gradient: 'gradient-1', // Pink/Purple/Magenta
  gradient: 'gradient-2', // Blue/Purple
  gradient: 'gradient-3', // Cyan/Teal
  gradient: 'gradient-4', // Orange/Coral
  gradient: 'gradient-5', // Pink/Fuchsia (default cho 20/10)
}
```

### **Thay đổi thời gian delay**

```typescript
delayMs: 3000, // Delay 3 giây sau khi load page
```

### **Thay đổi decorations (emojis)**

```typescript
decorations: ['🌸', '🌺', '💐', '🌷', '🌹', '💝', '✨', '🎀']
```

---

## 📱 Mobile Optimization

### **Responsive Breakpoints**

- **Mobile**: < 640px - Compact layout, larger touch targets
- **Tablet**: 640px - 1024px - Medium spacing
- **Desktop**: > 1024px - Full layout

### **Touch-Friendly Features**

✅ Min touch target: 44x44px (WCAG AAA compliant)
✅ Tap feedback animations
✅ No hover-only interactions
✅ Safe area insets (iPhone notch)
✅ Prevent scroll when popup open

### **Performance**

✅ GPU acceleration (`transform-gpu`)
✅ `will-change` optimization
✅ Reduced motion support
✅ Lightweight bundle (3.57 kB for test page)

---

## 🔧 Technical Details

### **State Management (Zustand)**

```typescript
import { useEventPopupStore } from '@/lib/stores/event-popup-store'

const { isOpen, isFlipped, openPopup, closePopup, flipCard } = useEventPopupStore()
```

**Methods:**
- `openPopup(eventId)` - Mở popup nếu chưa xem
- `closePopup()` - Đóng và mark as seen
- `flipCard()` - Flip card animation
- `hasSeenPopup(eventId)` - Check đã xem chưa
- `markAsSeen(eventId)` - Mark as seen manually

### **LocalStorage Keys**

```
event_notification_seen_womens-day-2025
event_notification_seen_my-event-2025
```

Format: `event_notification_seen_{eventId}`

### **CSS Utilities (Added)**

```css
.perspective-1000      /* 3D perspective */
.preserve-3d           /* Preserve 3D transforms */
.backface-hidden       /* Hide card back face */
.rotate-y-180          /* 180deg rotation */
.transform-gpu         /* GPU acceleration */
```

---

## 🎯 Design Principles (2025 Trends)

### **Front Card:**
- ✨ Minimalist elegance với clean lines
- 🎨 Gradient mesh backgrounds
- 💫 Subtle sparkle animations
- 🔘 Bold CTA button với shimmer effect
- 📝 Clear typography với elegant dividers

### **Back Card:**
- 🌸 Floral corner decorations
- 🎨 Soft gradient overlays
- 💎 Glass morphism effects
- ✍️ Handwritten font for signature
- 📐 Balanced whitespace

---

## 📊 Build Results

```
Route: /test-popup
Size: 3.57 kB
First Load JS: 118 kB

Status: ✅ Build successful
TypeScript: ✅ No errors
Warnings: None related to new code
```

---

## 🛠️ Troubleshooting

### **Popup không hiển thị?**

1. ✅ Check event dates trong config
2. ✅ Check `enabled: true`
3. ✅ Clear localStorage: `localStorage.removeItem('event_notification_seen_...')`
4. ✅ Check browser console for errors

### **Animation lag trên mobile?**

1. ✅ Đã optimize với `transform-gpu`
2. ✅ Reduced motion được support
3. ✅ Test trên real device (không chỉ emulator)

### **Card không flip?**

1. ✅ Check `onClick` handler
2. ✅ Ensure `isFlipped` state updates
3. ✅ Check CSS utility classes loaded

---

## 🚨 Production Checklist

Trước khi deploy:

- [ ] Xóa hoặc bảo vệ route `/test-popup`
- [ ] Set correct event dates
- [ ] Test trên real mobile devices
- [ ] Check localStorage permissions
- [ ] Verify content tiếng Việt
- [ ] Test với slow 3G network
- [ ] Verify popup chỉ hiện 1 lần

---

## 📝 Example Events

### **Sự kiện 20/10 (Women's Day)**
- **Thời gian:** 15/10/2025 - 21/10/2025
- **Theme:** gradient-5 (Pink/Magenta)
- **Style:** Floral, feminine, elegant

### **Future Events Ideas**
- 🎄 Giáng Sinh (Christmas)
- 🎆 Tết Nguyên Đán (Lunar New Year)
- 🎓 Khai giảng (Back to School)
- 🏆 Company Anniversary
- 🎊 Special Promotions

---

## 🤝 Credits

**Design Inspiration:**
- 2025 Greeting Card Trends
- Modern Card UI Best Practices
- Floral Design Patterns

**Technologies:**
- Next.js 15 App Router
- Tailwind CSS
- Zustand 5.0
- Radix UI
- TypeScript

---

**📅 Created:** 2025-01-18
**👨‍💻 Developer:** Claude Code Team
**📌 Version:** 1.0.0
**🎯 Purpose:** Special event notifications với beautiful UX
