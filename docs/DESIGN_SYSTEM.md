# 🎨 Design System - Company Memory Timeline

## 🌟 Concept: "Living Memories"

Thiết kế mới tập trung vào việc tạo ra trải nghiệm **sống động, cảm xúc và đắm chìm** cho người dùng khi họ khám phá và chia sẻ kỷ niệm công ty.

---

## 🎨 Color System

### Primary Colors
- **Primary (Purple/Magenta)** - `hsl(280, 85%, 62%)`
  - Tượng trưng cho kỷ niệm, cảm xúc và sự kết nối
  - Sử dụng cho các CTA chính và các điểm nhấn quan trọng

- **Secondary (Warm Coral)** - `hsl(15, 95%, 70%)`
  - Tượng trưng cho sự ấm áp và kết nối con người
  - Sử dụng cho các điểm nhấn phụ

- **Tertiary (Soft Cyan)** - `hsl(185, 85%, 65%)`
  - Tượng trưng cho nỗi nhớ và hoài niệm
  - Sử dụng cho các chi tiết và highlights

### Gradient System (5 Gradients)

Mỗi gradient có **3 điểm màu** thay vì 2 để tạo độ sâu và phong phú hơn:

1. **Gradient 1** (Pink to Purple)
   ```css
   linear-gradient(135deg,
     hsl(340, 95%, 68%) 0%,
     hsl(320, 85%, 62%) 50%,
     hsl(280, 85%, 62%) 100%)
   ```

2. **Gradient 2** (Blue to Purple)
   ```css
   linear-gradient(135deg,
     hsl(220, 90%, 70%) 0%,
     hsl(240, 85%, 65%) 50%,
     hsl(280, 80%, 60%) 100%)
   ```

3. **Gradient 3** (Teal to Cyan)
4. **Gradient 4** (Yellow to Orange)
5. **Gradient 5** (Red to Pink)

### Animated Gradient
- **Gradient Animated**: Background động với 4 màu mesh gradient
- Animation: 15s loop để tạo cảm giác sống động
- Sử dụng cho Hero Section

---

## ✨ Glassmorphism 2.0

### Enhanced Glass Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

### Glass Dark
- Sử dụng cho các overlay và modal
- Blur: 20px với saturation 160%

### Glass Gradient
- Kết hợp glass với gradient để tạo độ sâu
- Perfect cho buttons và cards

---

## 🎬 Animation System

### 1. Entry Animations

#### Slide In
- Duration: 0.7s
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Transform: `translateY(30px)` → `translateY(0)`

#### Slide Up
- Dùng cho cards và elements phía dưới
- Transform: `translateY(50px) scale(0.95)` → `translateY(0) scale(1)`

#### Scale In
- Duration: 0.5s
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce effect)
- Transform: `scale(0.8) rotate(-3deg)` → `scale(1) rotate(0)`

### 2. Hover Effects

#### Hover Lift
```css
.hover-lift:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.2),
    0 0 60px rgba(var(--primary), 0.15);
}
```

#### Hover Tilt (3D Effect)
```css
.hover-tilt:hover {
  transform: perspective(1000px)
             rotateX(2deg)
             rotateY(2deg)
             translateZ(10px);
}
```

#### Hover Glow
- Multi-layer glow với primary color
- Shadow: 0 0 40px primary với 3 layers

#### Hover Shimmer
- Shimmer effect chạy từ trái sang phải khi hover
- Duration: 0.6s

### 3. Background Animations

#### Blob Animation
- 8s infinite loop
- Transform với translate và scale
- Tạo cảm giác organic và sống động

#### Float Animation
- 6s infinite loop
- Kết hợp translateY và rotate nhẹ
- Perfect cho particles và floating elements

#### Pulse Slow
- 4s infinite loop
- Opacity và scale changes
- Dùng cho attention grabbers

### 4. Stagger Animations
- Children elements animate với delay incremental
- 5 children với delay 0.1s → 0.5s
- Creates waterfall effect

---

## 🎯 Component Design

### Hero Section
**Đặc điểm:**
- Full height (85vh) với gradient animated
- 4 animated blob elements với stagger delay
- 20 floating particles với random positions
- Glass morphism buttons với enhanced effects
- Stats cards với glass-gradient background

**Animations:**
- Blobs: 8s blob animation với different delays
- Particles: 4-8s float animation với random delays
- Content: Staggered slide-in với 0.15s increment

### Event Cards
**Đặc điểm:**
- Shadow: xl → 2xl on hover
- Border: 0 (frameless design)
- Background: gradient from white to gray-50/50
- Cover image: Scale 1 → 1.1 on hover (zoom effect)
- Multi-layer gradient overlay

**Hover Effects:**
1. **hover-lift**: translateY(-8px) + scale(1.02)
2. **hover-tilt**: 3D perspective tilt
3. **Shimmer**: White shimmer chạy qua card
4. **Image zoom**: Scale 1.1 với 700ms duration

**Internal Components:**
- Status badge: Glass-gradient với border
- Date section: Glass-gradient background, icon scale on hover
- Stats: 2 cards với glass-gradient, rounded-xl

### Timeline Navigation
**Đặc điểm:**
- Sticky position với backdrop-blur-2xl
- Z-index: 40 (above content)
- Border: soft border-border/50
- Shadow: sm for subtle depth

**Nav Items:**
- Padding: px-6 py-3 (more comfortable)
- Border-radius: 2xl (rounded-2xl)
- Font: bold instead of semibold
- Active: gradient + animated underline
- Hover: hover-lift + hover-shimmer

**Badge:**
- Active: white/25 background, white text, white/40 border
- Inactive: primary/15 background, primary text, primary/30 border
- Font: black (extra bold)

### Buttons
**Primary (Glass Gradient):**
```css
.glass-gradient {
  background: linear-gradient(135deg,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0.6) 100%);
  border: 2px solid rgba(255,255,255,0.5);
}
```

**Secondary (Glass):**
```css
.glass {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255,255,255,0.4);
}
```

---

## 📱 Mobile FAB
- Size: 80x80px (h-20 w-20)
- Background: gradient-animated
- Border: 4px white/30
- Position: bottom-8 right-8
- Effects: hover-lift + hover-glow + ripple

---

## 🎭 Particle System

### Floating Particles
- Count: 20 particles
- Size: 2x2px
- Color: white/40
- Animation: float với random delays (0-5s)
- Duration: random 4-8s
- Position: random 0-100% x và y

---

## 💫 Mesh Gradient Background

### Gradient Mesh
4 radial gradients tại các vị trí khác nhau:
- Top-left (20%, 30%): mesh-1 với opacity 0.4
- Top-right (80%, 20%): mesh-2 với opacity 0.35
- Bottom-right (70%, 70%): mesh-3 với opacity 0.3
- Bottom-left (30%, 80%): mesh-4 với opacity 0.35

Base: `hsl(var(--background))`

---

## 📐 Typography

### Fluid Typography Scale
```css
.text-fluid-xs: clamp(0.75rem, 1.5vw, 0.875rem)
.text-fluid-sm: clamp(0.875rem, 2vw, 1rem)
.text-fluid-base: clamp(1rem, 2.5vw, 1.125rem)
.text-fluid-lg: clamp(1.125rem, 3vw, 1.25rem)
.text-fluid-xl: clamp(1.25rem, 3.5vw, 1.5rem)
.text-fluid-2xl: clamp(1.5rem, 4vw, 2rem)
.text-fluid-3xl: clamp(2rem, 5vw, 3rem)
.text-fluid-4xl: clamp(2.5rem, 6vw, 3.5rem)
```

### Font Weights
- **font-bold**: 700 - for standard emphasis
- **font-black**: 900 - for titles and important text
- **font-semibold**: 600 - for secondary text
- **font-medium**: 500 - for body text

---

## 🎪 Best Practices

### Animation Delays
- Use staggered delays: 0.1s, 0.2s, 0.3s...
- For grids: multiply by index × 0.08s
- For hero elements: 0.15s increment

### Hover States
Always combine multiple effects:
1. hover-lift (movement)
2. hover-tilt or hover-scale (transformation)
3. hover-shimmer or hover-glow (visual effect)
4. Shadow transition

### Glass Morphism
- Always combine blur + saturation
- Use border với white/alpha
- Add inset shadow for depth
- Backdrop-filter: 16-20px blur

### Gradients
- Use 3 color stops minimum
- 135deg angle for diagonal feel
- Combine với opacity layers for depth
- Animate với background-position

---

## 🚀 Performance Tips

1. **Use transform instead of top/left**
   - `transform: translateY()` is GPU accelerated

2. **Backdrop-filter optimization**
   - Limit to small areas
   - Use will-change when needed

3. **Animation optimization**
   - Use `cubic-bezier` for natural feel
   - Prefer transform/opacity over other properties
   - Use `animation-fill-mode: backwards` for stagger

4. **Lazy animations**
   - Don't animate elements outside viewport
   - Use IntersectionObserver for scroll-triggered

---

## 🎨 Design Principles

### 1. Emotional Connection
- Warm colors (coral, pink, purple)
- Soft, rounded shapes (border-radius: 1.25rem+)
- Smooth, organic animations

### 2. Depth & Dimension
- Multi-layer shadows
- Glassmorphism for separation
- 3D transforms on interaction

### 3. Delight & Surprise
- Particle effects
- Shimmer animations
- Blob movements
- Hover transformations

### 4. Clarity & Hierarchy
- Fluid typography
- Clear visual weight (font-black vs font-bold)
- Color-coded information (gradients per category)

### 5. Motion Design
- Easing: cubic-bezier for natural feel
- Duration: 0.3-0.7s for most interactions
- Stagger: 0.08-0.15s delays
- Infinite loops: 4-15s for backgrounds

---

## 📊 Component Checklist

When designing new components, ensure:

- [ ] Uses fluid typography
- [ ] Has glass morphism variant
- [ ] Includes hover states (lift + secondary effect)
- [ ] Has proper shadow system (sm/md/lg/xl)
- [ ] Uses gradient from the system
- [ ] Has animation on entry (slide/scale/fade)
- [ ] Responsive padding/spacing
- [ ] Proper z-index layering
- [ ] Touch-friendly on mobile (44px min)
- [ ] Accessibility (contrast, focus states)

---

## 🎯 Key Improvements Summary

### Visual
✅ Enhanced color system với emotional palette
✅ 3-color gradients thay vì 2-color
✅ Glassmorphism 2.0 với enhanced blur và saturation
✅ Mesh gradient backgrounds
✅ Animated gradients cho hero sections

### Animation
✅ Advanced easing functions
✅ 3D hover effects (tilt, perspective)
✅ Blob animations cho organic feel
✅ Particle system
✅ Stagger animations
✅ Multi-layer shimmer effects

### Components
✅ Hero section với full-height immersive design
✅ Event cards với zoom + tilt + shimmer
✅ Enhanced navigation với animated underlines
✅ Glass-gradient buttons
✅ Responsive FAB với animated gradient

### Typography
✅ Fluid typography system
✅ Font-black cho emphasis
✅ Gradient text effects
✅ Improved line-heights và spacing

---

## 🎓 Usage Examples

### Creating a new card component:

```tsx
<div className="p-6 rounded-2xl glass-gradient hover-lift hover-tilt hover-shimmer shadow-xl">
  {/* Content */}
</div>
```

### Adding stagger animation to a list:

```tsx
<div className="stagger-fade-in">
  {items.map((item, i) => (
    <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
      {item}
    </div>
  ))}
</div>
```

### Creating animated hero:

```tsx
<section className="min-h-screen gradient-animated">
  <div className="absolute inset-0">
    <div className="animate-blob" />
    <div className="animate-blob" style={{ animationDelay: '2s' }} />
  </div>
  {/* Content with stagger */}
</section>
```

---

**Thiết kế bởi**: Claude (AI Design System Specialist)
**Version**: 2.0 - "Living Memories"
**Ngày**: 2025-10-17
