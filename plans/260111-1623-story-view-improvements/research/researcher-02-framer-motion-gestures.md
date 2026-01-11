# Framer Motion Gesture Handling Research

## 1. Detecting Horizontal vs Vertical Drag Intent

**Using `dragDirectionLock`:**
```tsx
<motion.div
  drag="x" // or "y" or true for both
  dragDirectionLock // Lock to first detected direction
/>
```

**Manual Detection with PanInfo:**
```tsx
const handleDragEnd = (e, info: PanInfo) => {
  const { offset, velocity } = info
  const isHorizontal = Math.abs(offset.x) > Math.abs(offset.y)

  if (isHorizontal) {
    // Handle horizontal navigation
  } else {
    // Handle vertical navigation
  }
}
```

## 2. Gesture Conflict Resolution

**Best Practice: Separate Drag Handlers**
- Outer container: `drag="y"` for vertical (event navigation)
- Inner container: Use tap zones instead of drag for horizontal (photo navigation)

**Why Tap Zones > Horizontal Drag:**
- No gesture conflicts
- Simpler implementation
- Matches Instagram UX (tap left/right)
- Better mobile performance

## 3. Performance for 60fps Mobile

**Key Optimizations:**
1. Use `useTransform` for derived values (GPU-accelerated)
2. Avoid state updates during drag - use motion values
3. Use `will-change: transform` on animated elements
4. Limit AnimatePresence children

**Example:**
```tsx
const x = useMotionValue(0)
const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5])

<motion.div style={{ x, opacity }} /> // No re-renders during drag
```

## 4. Nested Drag Components

**Pattern: Parent handles one axis, child handles other**
```tsx
// Parent: vertical event navigation
<motion.div drag="y" onDragEnd={handleEventSwipe}>
  {/* Child: tap zones for photo navigation (no drag) */}
  <div onClick={handlePhotoTap} />
</motion.div>
```

**Alternative: Disable parent drag when interacting with child**
```tsx
const [isDragging, setIsDragging] = useState(false)

<motion.div
  drag={!isDragging ? "y" : false}
  onDragStart={() => setIsDragging(true)}
  onDragEnd={() => setIsDragging(false)}
>
```

## 5. Story-Like Navigation Implementation

**Recommended Architecture:**
```
StoryReelTimeline (vertical swipe between events)
├── EventSlide (current event)
│   ├── PhotoDisplay (current photo with transitions)
│   ├── TapZoneLeft (previous photo)
│   ├── TapZoneRight (next photo)
│   └── ProgressBar (per-photo segments)
└── Preloader (next photos/events)
```

**Key State:**
```tsx
const [eventIndex, setEventIndex] = useState(0)
const [photoIndex, setPhotoIndex] = useState<Record<number, number>>({})
// photoIndex[eventIndex] = current photo for each event
```

## Sources
1. [Framer Motion Gestures Docs](https://www.framer.com/motion/gestures/)
2. [Framer Motion useTransform](https://www.framer.com/motion/use-transform/)
3. [Building Story-like UI with Framer Motion](https://blog.maximeheckel.com/)

## Unresolved Questions
1. Should we use `dragElastic` for bounce effect at boundaries?
2. Optimal threshold values for tap vs drag detection on various devices?
