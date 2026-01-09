# Mobile Gesture Patterns Research (2025-2026)

## Overview: 2025-2026 Trends
- **Invisible UI**: Move toward gesture-only navigation for "immersion first" experiences.
- **Haptic Feedback Integration**: Precise vibration response for every gesture phase.
- **Foldable Optimization**: Adaptive gestures that account for screen crease and varying aspect ratios.
- **Thumb Zone Focus**: 49%+ users are single-thumb; interactive elements prioritize the bottom 2/3 of screen.

## Core Patterns

### 1. Swipe Navigation (Photo Gallery)
- **Horizontal**: `Paginated` view with momentum. Interrupted swiping for fast-seeking.
- **Vertical**: Swipe down to dismiss/exit full-screen. Swipe up for details/metadata.
- **Edge Swiping**: System-level "Back" vs. App-level "Next/Prev". App-level needs ~10-15px dead zone.

### 2. Pinch-to-Zoom
- **Implementation**: Center-of-pinch scaling. Velocity-based momentum on release.
- **Snap-to-Bounds**: Auto-reset to 1.0x or 3.0x max if released near boundaries.
- **Double-Tap**: Toggle between 1.0x and 2.5x (standard in Google Photos/iOS).

### 3. Pull-to-Refresh
- **Visuals**: Liquid/elastic header animations. Haptic "click" at trigger point.
- **Trend**: Moving away from standard spinners to branded, contextual animations (e.g., logo pulse).

### 4. Long-Press & Context Menus
- **Trigger**: 300-500ms hold.
- **UI**: Blur background, pop-out element (Haptic Touch style).
- **Secondary Actions**: Multi-select entry point (standard pattern).

### 5. Multi-Select Drag Patterns
- **Entry**: Long-press on first item + move without lifting.
- **Visuals**: Rubber-band selection box or "checking" items as finger passes over.
- **Edge Auto-Scroll**: Scroll container when dragging near top/bottom edges.

### 6. Bottom Sheet Gestures
- **Snap Points**: Partial (40%), Standard (60%), Full (95%).
- **Dismissal**: Velocity-based fling down.
- **Interaction**: Prevent nested scroll conflicts (Sheet vs. Content).

## Recommended Libraries
1. **@use-gesture/react** (Standard): Best for low-level control of drag/pinch/swipe. Pairs with **react-spring** for performant animations.
2. **Framer Motion**: Easiest for "Enter/Exit" and simple gesture animations.
3. **dnd-kit**: Superior for multi-select and reordering grids.
4. **vaul**: Headless drawer/bottom-sheet component for React.

## Implementation Strategy
- **Library Choice**: Combine `@use-gesture/react` with `react-spring`.
- **Performance**: Use `requestAnimationFrame` (intrinsic to react-spring) and `will-change: transform`.
- **Accessibility**: Provide button fallbacks for all gestures. Use ARIA labels for gesture-driven state changes.

## Unresolved Questions
1. Impact of spatial gestures (Vision Pro/XR) on mobile-only gesture mental models?
2. Standardization of "Tri-fold" screen gesture zones?
3. Energy consumption delta for high-frequency haptic gesture feedback?
