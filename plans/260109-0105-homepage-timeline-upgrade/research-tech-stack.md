# Research Report: Modern Timeline Tech Stack for Next.js 15

## 1. Executive Summary
To achieve a high-performance, mobile-first timeline with 80% mobile traffic, we recommend a hybrid approach: **Motion One** for lightweight UI micro-interactions and **React Virtuoso** for the photo-heavy timeline feed. While **Framer Motion** is standard, its bundle size and main-thread execution make it secondary to **Motion One** (WAAPI-based) for mobile performance.

## 2. Animation Libraries Comparison
| Library | Size (Gzip) | Performance | Best Use Case |
| :--- | :--- | :--- | :--- |
| **Motion One (v10)** | **~2 KB** | **Excellent (WAAPI)** | Performance-critical mobile UI |
| **Framer Motion (v12)** | ~30 KB | Good | Complex React-state UI |
| **GSAP (v3.12)** | ~60 KB | Exceptional | High-fidelity bespoke timelines |
| **React Spring** | ~45 KB | Good | Physics-based animations |

**Recommendation**: Use **Motion One** for the primary timeline animations. It runs on the compositor thread via the Web Animations API, bypassing the JS main thread bottlenecks common on mobile.

## 3. Scroll-Driven Animations
- **CSS `scroll-timeline`**: Native, off-thread, zero jank. Supported in Chrome 115+, Edge 115+.
- **GSAP ScrollTrigger**: Feature-rich, cross-browser, but runs on main thread.
- **Mobile Strategy**: Use CSS `scroll-timeline` for simple fade/scale effects. For Safari/Firefox, fallback to `IntersectionObserver` (already implemented) or a lightweight polyfill. Avoid heavy JS scroll listeners.

## 4. Virtual Scrolling for Large Galleries
- **React Virtuoso (v4)**: **Top Choice**. Best-in-class support for dynamic item heights (critical for varied photo aspect ratios and variable text lengths). "Batteries-included" with sticky headers.
- **TanStack Virtual (v3)**: Highly flexible, headless. Good if the layout is highly custom (e.g., masonry).
- **Mobile Implication**: Virtualization is mandatory for timelines > 50 posts to prevent DOM bloat and memory crashes on low-end mobile devices.

## 5. Image & Performance Benchmarks
- **Next.js 15 `<Image>`**: Utilize `priority` for above-the-fold content and `placeholder="blur"` (already in codebase).
- **Sharp / WebP**: Ensure backend continues to serve WebP.
- **GPU Acceleration**: Always animate `transform` and `opacity`. Never animate `top`, `left`, or `height` to avoid layout shifts (CLS).

## 6. Recommended Tech Stack
- **Animations**: `motion` (Motion One) @ latest
- **Virtualization**: `react-virtuoso` @ ^4.0.0
- **Scroll Tracking**: `IntersectionObserver` (Native) + CSS `scroll-timeline`
- **Core**: Next.js 15.1+, React 19

## 7. Sources
1. [Framer Motion vs GSAP vs Motion One Performance](https://cuibit.com/framer-motion-vs-gsap-vs-motion-one/)
2. [TanStack Virtual vs React Virtuoso Comparison](https://medium.com/@vertex/tanstack-virtual-vs-react-virtuoso-2024/)
3. [CSS Scroll-Driven Animations (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
4. [High Performance Animations (web.dev)](https://web.dev/animations-guide/)
5. [Next.js 15 Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)

## Unresolved Questions
- Should we implement a masonry layout or a strict vertical timeline? (Affects virtualization choice)
- Does the current Supabase Storage bandwidth support high-concurrency WebP streaming for 100+ items?
