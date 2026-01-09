# Researcher Report: Homepage & Timeline Design Upgrade (2025-2026)

**ID:** researcher-260109-0107-homepage-timeline-upgrade
**Date:** 2026-01-09
**Subject:** Design trends, typography, and visual strategy for Teky Hoàng Mai Memory Timeline.

## 1. Design Style: Beyond Glassmorphism
The current "Glassmorphism" is evolving into **Layered Minimalism** and **Bento Grids 2.0**.
- **Active Grids:** Transition from static lists to asymmetrical "Bento" layouts.
- **Micro-Depth:** Use of 1px luminous borders (`hsla`) and soft, multi-layered shadows instead of heavy background blurs.
- **Human Centricity:** Warmer tones (Mocha/Solace) to balance the high-tech purple brand.

## 2. Typography Strategy (Vietnamese Optimized)
Current codebase uses `Inter`. For a "Memory" platform in Vietnam, **Be Vietnam Pro** is the superior choice for headings due to its refined diacritic handling.

- **Primary Heading:** `Be Vietnam Pro` (Weights: 700, 500)
- **Body/UI:** `Inter` (Weights: 400, 600) - keep for legibility.
- **Sizes:**
  - Hero Title: `text-fluid-4xl` (approx 3.5rem desktop)
  - Subheaders: `text-fluid-xl` (approx 1.5rem)
  - Body: `text-fluid-base` (approx 1rem)

## 3. Color Palette (HSL)
Integrating Teky's purple with nostalgia-evoking neutrals.

| Token | HSL | Usage |
|-------|-----|-------|
| `--primary` | `270 70% 50%` | Brand Purple |
| `--nostalgia-warm` | `20 15% 70%` | Mocha Mousse (Background/Soft UI) |
| `--calm-blue` | `210 30% 75%` | Solace Blue (Secondary accents) |
| `--luminous-border` | `270 70% 90% / 0.3` | Card edges for 3D depth |

## 4. Interaction Patterns
- **Pulse Points:** Vertical timeline line replaced with glowing, micro-animated dots.
- **Tilt Effect:** Magnetic/Gyroscope-based card tilting for mobile (Spatial UI).
- **Hover Expansion:** Bento tiles that expand to show wish text on desktop.

## 5. Citations
- [UI Trends 2025: Immersive & Spatial](https://medium.com/@ui-trends-2025)
- [Bento Grid Organization](https://onecodesoft.com/bento-grids)
- [Google Fonts: Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro)
- [Pantone 2025 Color Psychology](https://vividcreative.com/color-trends-2025)

## Unresolved Questions
- Should "Be Vietnam Pro" be loaded via `next/font/google` globally or only for specific components?
- Is the current "Falling Petals" performance acceptable on low-end Android devices used by students?
- Do we need a "Compact View" toggle for users who prefer lists over Bento grids?
