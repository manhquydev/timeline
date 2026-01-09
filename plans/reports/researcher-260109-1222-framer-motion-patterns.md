# Framer Motion Patterns 2025-2026: Gallery & Timeline
Author: Antigravity Researcher
Date: 2026-01-09

## 1. Next.js App Router Transitions
Use a **Client Component Wrapper** in `layout.tsx`. Note: `AnimatePresence` requires `mode="wait"` for sequential transitions.

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## 2. Shared Element Transitions (Grid to Lightbox)
`layoutId` is the gold standard for "morphing" elements between states.
**Pro Tip:** Use `layoutId` on the container, not just the image, to maintain aspect ratio logic.

```tsx
// Grid Item
<motion.div layoutId={`card-${id}`} onClick={() => setSelected(id)}>
  <motion.img src={src} layoutId={`img-${id}`} />
</motion.div>

// Lightbox (Overlay)
<AnimatePresence>
  {selectedId && (
    <motion.div layoutId={`card-${selectedId}`} className="expanded">
      <motion.img src={src} layoutId={`img-${selectedId}`} />
      <button onClick={() => setSelected(null)}>Close</button>
    </motion.div>
  )}
</AnimatePresence>
```

## 3. Staggered List Animations
Orchestrate children via parent variants. Avoid manual delays.

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

// Usage
<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i} variants={item} />)}
</motion.div>
```

## 4. Scroll-Triggered Timeline
Use `useScroll` with `target` ref for localized timelines.

```tsx
const targetRef = useRef(null);
const { scrollYProgress } = useScroll({
  target: targetRef,
  offset: ["start end", "end end"]
});

const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

return (
  <div ref={targetRef} className="relative">
    <motion.div className="progress-bar" style={{ scaleY }} />
    {/* Timeline items */}
  </div>
);
```

## 5. Swipe-to-Dismiss Gallery
Leverage `drag` and `dragConstraints`. Combine with `onDragEnd` for logic.

```tsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  onDragEnd={(e, info) => {
    if (info.offset.y > 100) dismiss();
  }}
  whileDrag={{ scale: 0.95 }}
>
  <img src={src} draggable={false} />
</motion.div>
```

## 6. Performance Optimization (2025+)
- **Lightweight Package:** Use `import { motion } from "motion/react"` (the new lighter entry point).
- **GPU Acceleration:** Prefer `x`, `y`, `scale`, `rotate` (transforms) over `top`, `left`, `width`, `height` (layout).
- **Will-Change:** Framer Motion applies `will-change: transform` automatically during animations. Avoid manual application unless necessary for Safari fixes.
- **Reduced Motion:** Always respect user settings:
  ```tsx
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3 };
  ```

## Unresolved Questions
- Integration with the native **View Transitions API** in Next.js 15+ for cross-route shared elements without `layoutId` overhead.
- Performance limits of `layoutId` when animating >50 items simultaneously on low-end mobile.

## Sources:
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Next.js App Router Animations](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Staggered Animations Guide](https://medium.com/@anton.v/framer-motion-stagger-animations-9f1c7d2c3e1b)
- [Shared Element Transitions Analysis](https://sethcorker.com/framer-motion-layoutid-explained)
- [Gesture Callbacks & Cancellation](https://youtube.com/watch?v=ErStEYR8bCf)
