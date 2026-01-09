# Research Report: Modern Design Systems & Trends (2025-2026)
**Date:** 2026-01-09
**Status:** Completed
**Focus:** Next.js/React, Vietnamese Support, Corporate Aesthetics

## 1. Component Libraries & Design Systems
The landscape for 2025-2026 shifts away from "all-in-one" heavy libraries toward **headless primitives** and **modular CLI-driven components**.

| Library | Type | Best For | Pros/Cons |
|---------|------|----------|-----------|
| **shadcn/ui** | Headless (Radix + Tailwind) | Modern SaaS, Custom Dashboards | **Pros:** Zero bundle bloat, full code ownership. **Cons:** Manual updates. |
| **Mantine v7** | Full Suite (Native CSS) | Feature-rich Admin Tools | **Pros:** 100+ hooks/components, native SSR. **Cons:** Harder to "un-style". |
| **NextUI** | Styled (Tailwind) | Consumer-facing, High Polish | **Pros:** Beautiful defaults, Framer Motion integration. **Cons:** Opinionated. |
| **MUI (Base UI)** | Evolution of Material | Enterprise standard | **Pros:** Massive ecosystem. **Cons:** Material v2 can look "dated" without heavy skinning. |
| **Radix UI** | Pure Primitives | Design System Engineers | **Pros:** Best-in-class accessibility. **Cons:** No default styles. |

**Recommendation:** **shadcn/ui** remains the gold standard for flexibility in 2026, allowing "just-in-time" component adoption.

## 2. Color Palette Trends: Corporate 2.0
Moving beyond sterile "SaaS Blue" (#0070F3) toward grounding, sophisticated palettes.

*   **Earth-Tone Corporate:** Warm Taupe, Charcoal, and Deep Slate. Replaces cold grays with limestone (#F5F5F0) or bone white.
*   **Deep Atlantic:** Deep Teals (#0D282E) paired with Electric Cyan (#00E5FF) accents for tech-forward brands.
*   **Royal Noir:** Matte Black, Soft Zinc, and Bronze/Gold accents for premium/executive interfaces.
*   **Soft-Tech Pastels:** Misty Lavender and Washed Mint for AI/Human-centric services (e.g., ChatGPT-style interfaces).

## 3. Typography: Vietnamese Excellence
Fonts must support the complex diacritics of Vietnamese without "stacking" or clipping issues.

| Font Pair (Heading + Body) | Style | Google Fonts Names |
|----------------------------|-------|--------------------|
| **Be Vietnam Pro + Inter** | Tech/Start-up | `Be Vietnam Pro`, `Inter` |
| **Montserrat + Open Sans** | Versatile/Modern | `Montserrat`, `Open Sans` |
| **Manrope + Manrope** | Geometric/Clean | `Manrope` (Variable font) |
| **Syne + Questrial** | Creative/Bold | `Syne`, `Questrial` |
| **Playfair Display + Be Vietnam Pro** | Elegant/Corporate | `Playfair Display`, `Be Vietnam Pro` |

**Key Feature:** Use **Variable Fonts** (wght, slnt) to reduce 4-5 file requests to a single request for mobile performance.

## 4. Mobile-First Spacing & Grid (80/20 Rule)
With 80% mobile traffic, the grid must be **fluid-first**, not breakpoint-first.

*   **Spacing:** Shift from fixed `px` to `rem` or `clamp()` for fluid scaling.
*   **The "Rule of 4":** Use 4px increments (4, 8, 16, 24, 32, 64) for consistent rhythm.
*   **Touch Targets:** Minimum 44px x 44px for all interactive elements.
*   **Micro-Layouts:** Flexbox-based 1-column (mobile) -> 2-column (tablet) -> 4/12-column (desktop).

## 5. Icon Libraries & Usage
*   **Lucide React:** The standard for 2026 (fork of Feather). Lightweight, consistent stroke.
*   **Phosphor Icons:** Excellent for distinct styles (Thin, Light, Regular, Bold, Fill).
*   **Tabler Icons:** Massive library (3000+) for data-heavy apps.
*   **Pattern:** Use `outline` for general UI and `fill` for active/selected states to reduce cognitive load.

## 6. Visual Styles: Beyond Minimalism
*   **Bento Grids:** Grouping features into rounded, distinct cards (popularized by Apple/Linear).
*   **Subtle Glassmorphism:** Using `backdrop-blur-md` on navigation and headers to maintain context while scrolling.
*   **Enhanced Shadows:** Moving from flat design to multi-layered, soft shadows (UMBRA/PENUMBRA) to create depth without skeuomorphism.
*   **Micro-animations:** Using Framer Motion for layout transitions (e.g., list items sliding in) to signify app "life."

## 7. Sources
* [Design Trends 2025/2026 - Builder.io](https://www.builder.io/blog/design-trends-2025)
* [Vietnamese Typography Guide - Google Fonts](https://fonts.google.com/knowledge/choosing_type/typography_for_vietnamese)
* [shadcn/ui Documentation](https://ui.shadcn.com/)
* [Modern Color Trends - VistaPrint/Wannathis](https://www.vistaprint.com/hub/color-trends-2025)

## Unresolved Questions
* Should the codebase prioritize Lucide or Phosphor for consistency?
* Is there a specific corporate brand book (Teky) that overrides these general trends?
