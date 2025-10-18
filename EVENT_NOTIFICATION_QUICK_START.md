# Event Notification Popup - Quick Start 🚀

## 🎯 Tóm tắt

Hệ thống popup thông báo sự kiện với **3D flip card** đẹp mắt, mobile-first, chỉ hiển thị **1 lần/người dùng**.

---

## ⚡ Test ngay (5 phút)

### **1. Chạy dev server**

```bash
npm run dev
```

### **2. Mở test page**

Truy cập: **`http://localhost:3000/test-popup`**

### **3. Preview popup**

- Click **"Mở Popup"**
- Click vào card để **flip**
- Test trên **mobile**
- Dùng **"Reset Storage"** để xem lại

---

## 📅 Sự kiện hiện tại

### **Ngày Phụ Nữ Việt Nam 20/10**

- **Thời gian:** 15/10/2025 - 21/10/2025
- **Auto-show:** Sau 2 giây khi load page
- **Theme:** Pink/Magenta gradient
- **Nội dung:** Thiệp chúc tiếng Việt

---

## 🎨 Thiết kế

### **Mặt trước (Front)**
- Icon lớn với glow effect
- Title + Subtitle elegant
- CTA button với shimmer
- Gradient mesh background

### **Mặt sau (Back)**
- Hoa văn 4 góc
- Greeting box glass morphism
- Typography đẹp mắt
- Signature handwritten

---

## ⚙️ Cấu hình sự kiện mới

**File:** `lib/config/event-notifications.ts`

```typescript
export const myEventConfig: EventNotificationConfig = {
  id: 'my-event-2025',
  enabled: true,
  startDate: new Date('2025-12-20T00:00:00'),
  endDate: new Date('2025-12-25T23:59:59'),
  delayMs: 2000,

  content: {
    front: {
      title: '🎄 Sự kiện của bạn',
      subtitle: 'Nhấn để khám phá',
      icon: '🎁',
      ctaText: 'Mở thiệp',
    },
    back: {
      title: 'Chúc mừng!',
      message: 'Lời chúc của bạn...',
      greeting: 'Happy Holidays! 🎅',
      decorations: ['🎄', '⭐', '🎁', '❄️'],
    },
  },

  theme: {
    gradient: 'gradient-2', // Chọn 1-5
    accentColor: 'hsl(var(--gradient-2-start))',
  },
}

// Thêm vào getActiveEventNotification()
```

---

## 🎨 Theme Gradients

Chọn gradient trong config:

```typescript
theme: {
  gradient: 'gradient-1', // Pink/Purple/Magenta
  gradient: 'gradient-2', // Blue/Purple
  gradient: 'gradient-3', // Cyan/Teal
  gradient: 'gradient-4', // Orange/Coral
  gradient: 'gradient-5', // Pink/Fuchsia (20/10)
}
```

---

## 📱 Mobile-First

✅ Touch-friendly (44x44px targets)
✅ Responsive design
✅ GPU-accelerated animations
✅ Safe area insets (notch)
✅ Prevent scroll when open

---

## 🔧 Tắt/Bật popup

```typescript
export const womensDay2025Config = {
  enabled: false, // ← Tắt popup
  // ...
}
```

---

## 🛠️ Files quan trọng

```
components/event-notifications/
├── event-notification-popup.tsx  # Main popup
├── flip-card.tsx                  # 3D card
└── index.ts

lib/
├── stores/event-popup-store.ts    # State
└── config/event-notifications.ts  # Config ⭐

app/
├── layout.tsx                     # Integration
└── test-popup/page.tsx            # Test page
```

---

## ✅ Build Status

```bash
npm run build
```

**Results:**
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ Route /test-popup: 3.57 kB
- ✅ Production ready

---

## 🚨 Production Checklist

Trước khi deploy:

- [ ] Xóa/bảo vệ route `/test-popup`
- [ ] Set đúng event dates
- [ ] Test trên mobile thật
- [ ] Verify nội dung tiếng Việt
- [ ] Check popup chỉ hiện 1 lần

---

## 📚 Full Documentation

Xem chi tiết: **`docs/EVENT_NOTIFICATION_SYSTEM.md`**

---

## 🎯 Quick Commands

```bash
# Test
npm run dev
# → http://localhost:3000/test-popup

# Build
npm run build

# Clear popup history (Browser console)
localStorage.removeItem('event_notification_seen_womens-day-2025')
```

---

**Version:** 1.0.0 | **Status:** ✅ Ready
**Docs:** `EVENT_NOTIFICATION_SYSTEM.md`
