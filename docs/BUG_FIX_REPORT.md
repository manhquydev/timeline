# Bug Fix Report: Maximum Update Depth Exceeded

## 🔴 Vấn Đề

**Lỗi**: `Maximum update depth exceeded` - Infinite re-render loop trong photo lightbox component

**Triệu chứng**:
- Console bị spam với hàng nghìn dòng error
- Browser bị đơ/lag khi mở lightbox xem ảnh
- App crash sau vài giây

## 🔍 Root Cause Analysis

### Nguyên nhân gốc

Vòng lặp vô hạn xảy ra do **conflict giữa controlled component pattern và internal state management** của thư viện `yet-another-react-lightbox`:

```typescript
// ❌ CODE CŨ (CÓ VẤN ĐỀ)
export function PhotoLightbox({ posts, initialIndex, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Vấn đề 1: useEffect lắng nghe initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)  // Re-render khi initialIndex thay đổi
    }
  }, [isOpen, initialIndex])

  // Vấn đề 2: handleView callback tạo vòng lặp
  const handleView = useCallback(({ index }: { index: number }) => {
    setCurrentIndex(index)  // Cập nhật state
  }, [])

  return (
    <Lightbox
      index={currentIndex}  // Vấn đề 3: Truyền state vào
      on={{ view: handleView }}  // Vấn đề 4: Callback gây re-render
      // ...
    />
  )
}
```

### Luồng gây infinite loop

```
1. User swipe ảnh trong lightbox
   ↓
2. Lightbox internal state thay đổi → trigger on.view callback
   ↓
3. handleView() được gọi → setCurrentIndex(newIndex)
   ↓
4. currentIndex state thay đổi → Component re-render
   ↓
5. Lightbox nhận index prop mới → Internal reconciliation
   ↓
6. Internal logic trigger on.view lại (do index thay đổi)
   ↓
7. Quay lại bước 2 → VÒNG LẶP VÔ HẠN ∞
```

### Tại sao lại xảy ra?

**Controlled vs Uncontrolled Component Conflict**:
- `yet-another-react-lightbox` có **internal state** để quản lý current slide
- Khi truyền `index` prop + `on.view` callback, ta đang cố gắng **control** component
- Nhưng thư viện **không được thiết kế** để fully controlled → gây conflict
- Mỗi lần external state sync với internal state → trigger callback → update external state → re-render → sync lại → **infinite loop**

## ✅ Giải Pháp

### Cách fix

**Nguyên tắc**: Sử dụng **uncontrolled pattern** - để Lightbox tự quản lý internal state, chỉ truyền `initialIndex` một lần khi mở.

```typescript
// ✅ CODE MỚI (ĐÃ FIX)
export function PhotoLightbox({ posts, initialIndex, isOpen, onClose }) {
  // ✅ Loại bỏ currentIndex state
  // ✅ Loại bỏ useEffect
  // ✅ Loại bỏ handleView callback

  // Chỉ memoize config objects để tối ưu performance
  const slides = useMemo(() =>
    posts.map(post => ({
      src: post.media_url,
      alt: post.wish_text || 'Ảnh sự kiện',
      width: post.dimensions?.width || 1200,
      height: post.dimensions?.height || 800,
    })),
    [posts]
  )

  const animationConfig = useMemo(() => ({
    fade: 300,
    swipe: 300,
  }), [])

  // ... other configs

  if (!isOpen) return null

  return (
    <Lightbox
      open={true}
      close={onClose}
      slides={slides}
      index={initialIndex}  // ✅ Chỉ truyền initialIndex, không track changes
      animation={animationConfig}
      controller={controllerConfig}
      carousel={carouselConfig}
      styles={stylesConfig}
      // ✅ KHÔNG truyền on.view callback
    />
  )
}
```

### Những thay đổi chính

1. **Loại bỏ `useState(currentIndex)`** - không cần track internal state
2. **Loại bỏ `useEffect`** - không sync state
3. **Loại bỏ `handleView` callback** - không update state khi swipe
4. **Loại bỏ `on` prop** - không listen vào internal events
5. **Giữ `index={initialIndex}`** - chỉ set initial value, không control

### Tại sao giải pháp này hoạt động?

- **Uncontrolled pattern**: Lightbox quản lý internal state hoàn toàn độc lập
- **No circular dependency**: Không có callback nào trigger re-render
- **Single source of truth**: Internal state là source of truth cho current slide
- **Props chỉ dùng để initialize**: `initialIndex` chỉ được dùng khi component mount
- **Parent không track**: Component cha không cần biết user đang ở slide nào

## 📊 Kết Quả

### Trước khi fix
- ❌ Console spam ~2600+ dòng error
- ❌ Browser freeze/lag
- ❌ App crash sau 3-5 giây

### Sau khi fix
- ✅ Console sạch sẽ
- ✅ Lightbox hoạt động mượt mà
- ✅ Swipe/navigation không có issue
- ✅ Performance tốt

### Build status
```bash
$ npm run build
✓ Compiled successfully in 4.8s
✓ Linting and checking validity of types
✓ Generating static pages (14/14)
```

## 🎓 Bài Học

### 1. Controlled vs Uncontrolled Components

**Controlled Component**:
```typescript
// Parent quản lý hoàn toàn state
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

**Uncontrolled Component**:
```typescript
// Component tự quản lý state, parent chỉ set initial value
<Input defaultValue={initialValue} />
```

**Khi nào dùng gì?**
- Controlled: Khi cần validate, transform, hoặc sync với external state
- Uncontrolled: Khi component đủ phức tạp (như lightbox) và có internal logic riêng

### 2. Cẩn thận với Callbacks + State Updates

**Anti-pattern** (gây infinite loop):
```typescript
const [state, setState] = useState(value)

const handleChange = useCallback((newValue) => {
  setState(newValue)  // ❌ Re-render
}, [])

<Component
  value={state}  // ❌ Truyền state vào
  onChange={handleChange}  // ❌ Component trigger callback
/>
// → Component update state → re-render → update state → ∞
```

**Best practice**:
```typescript
// Hoặc fully controlled:
<Component value={state} onChange={setState} />

// Hoặc fully uncontrolled:
<Component defaultValue={initialValue} />
```

### 3. Hiểu Thư Viện Trước Khi Dùng

- Đọc docs để biết component là controlled hay uncontrolled
- Không cố ép pattern không phù hợp vào thư viện
- Test kỹ với real data trước khi deploy

## 🔗 Files Changed

- `components/photos/photo-lightbox.tsx` - Fixed infinite loop
- **Loại bỏ**: 50 dòng code không cần thiết
- **Kết quả**: Code đơn giản hơn, performance tốt hơn

## 🚀 Deployment

```bash
# 1. Verify fix locally
npm run dev

# 2. Test lightbox functionality
# - Click vào ảnh bất kỳ
# - Swipe left/right
# - Close lightbox
# - Repeat vài lần

# 3. Build for production
npm run build

# 4. Start production server
npm run start
```

## ✅ Verification Checklist

- [x] Console không có error
- [x] Lightbox mở/đóng bình thường
- [x] Swipe navigation hoạt động
- [x] Close button hoạt động
- [x] Backdrop click close hoạt động
- [x] Multiple open/close không gây leak
- [x] Build thành công
- [x] No TypeScript errors
- [x] No ESLint warnings

---

**Fixed by**: AI Assistant (Claude Code)
**Date**: 2025-01-XX
**Status**: ✅ Resolved
