# UI/UX Research Report: Company Memory Timeline (2025-2026)

## 1. Design Systems & Aesthetics 2025
- **Design Tokens as DNA**: Transition from hardcoded values to machine-readable tokens (colors, spacing, typography) for cross-platform consistency.
- **Glassmorphism & Depth**: Use of translucent, blurred panels ("Liquid Glass" aesthetic) to create visual hierarchy without heavy borders.
- **Retro-Modern Typography**: Mixing 70s/80s "groovy" fonts with clean, modern sans-serifs for a warm, familiar brand feel.
- **Deconstructed Layouts**: Moving away from rigid grids to "unaligned" images and content snippets to increase user intrigue.
- **AI-Enhanced Systems**: Tools like Figma-to-Code and automated accessibility audits are now standard in design workflows.

## 2. Modern Photo Gallery UX
- **Dynamic Masonry**: Intelligent grid layouts that adapt to photo aspect ratios while maintaining a cohesive "timeline" feel.
- **Immersive Lightboxes**: Edge-to-edge viewing with minimal UI overlays; controls appear only on tap.
- **Contextual Meta-data**: Displaying "wish text" or event details via subtle glassmorphism overlays instead of separate blocks.
- **Progressive Loading**: Use of Blurhash/LQIP (Low-Quality Image Placeholders) and Next.js `priority` property for LCP (Largest Contentful Paint) optimization.

## 3. Mobile-First & Gesture Patterns
- **Thumb-Zone Optimization**: Placing critical actions (upload, like, share) in the bottom 30% of the screen.
- **Haptic Feedback**: Subtle vibration triggers for successful uploads or long-press actions to mimic physical interaction.
- **Swipe-to-Dismiss**: Natural gesture navigation for closing photos or exiting sub-menus, replacing small "X" buttons.
- **Bottom Sheet Dominance**: Using expandable bottom sheets for comments, details, and settings instead of full-page transitions.

## 4. Micro-interactions (Framer Motion focus)
- **Gesture-Controlled States**: `whileTap` and `whileHover` for tactile feedback; `drag` constraints for interactive galleries.
- **AnimatePresence transitions**: Smooth entry/exit animations for "Like" hearts, upload progress bars, and modal overlays.
- **Overscroll & Spring Physics**: Using spring-based animations to make the UI feel "organic" and responsive to user speed.
- **Shared Layout Animations**: Using Framer Motion's `layoutId` to morph a gallery thumbnail into a full-screen view seamlessly.

## 5. Accessibility (WCAG 2.1 AA)
- **Semantic Image Handling**: Strict requirement for descriptive `alt` text; decorative images marked with `role="presentation"`.
- **Keyboard Trap Prevention**: Ensuring modallightboxes don't trap keyboard focus and are escapable via 'Esc' key.
- **Contrast Ratios**: Minimum 4.5:1 for text overlays on photos; using semi-transparent dark backdrops for readability.
- **Next.js 15 A11y**: Leveraging built-in `next/image` features to prevent Cumulative Layout Shift (CLS).

## 6. Actionable Recommendations (Next.js/React)
- **Framework**: Upgrade to **Next.js 15** for improved `next/image` optimization and faster hydration.
- **Styling**: Use **Tailwind CSS 4.0** with **Radix UI Primitives** for unstyled, accessible components.
- **Animation**: Implement **Framer Motion** for shared-element transitions between the timeline and photo detail views.
- **State**: Use **Zustand** for lightweight global state (e.g., gallery filters, upload progress).
- **Optimization**: Implement **TanStack Query** for infinite scroll with "windowing" (virtualization) to handle large event galleries.

## Sources
- [Modern Design Systems 2025 (Muksal Creative)](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFpytlPqQytpjN_sVGDstzQrYwvAg8jMuVRpcGF-XWUL0aQn0oH-K12enXvkRMuXUolYJUHCwCndDaOJTrzznfiGQfVBb88142FJGPVqGea8NoZRehiK-mO8J_0QIZLWhndwvS3Teu6IZSJQmupUzHosNQGx20EMOM=)
- [Next.js 15 Accessibility Best Practices (Strapi)](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFbE-WBnkcSrTSTdFqLJYt5SS88s7SfypY-Eo3jn8GgidNzcDHKJ8rAGqbJkUUGxsho93ydomBnt1qgA3cn5c5lS3PA_n7ADwkWh11nOqt_5yNVI0JBIbxFlriZsEdM9vjPaT8xbq7hAadpdYTE37BeChRAetOcxCGLKIu5ZXD9OA==)
- [Framer Motion Micro-interactions (Numi Tech)](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGR1rWc_FzoUOrlxL4iYtF7sZXRH2uVDcTlvzXkbdatzIF-zumd_01eGFzuNOa3aZSjYq8ACg9AWxJqf0AFnoxbbpDpaWoMPm2RGw3OxWjGYVANyzIXGha7Vnsv9Q3a4_ta-LmvVMT2KUyhFgc=)
- [Mobile UI Trends 2025 (UX Studio)](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGHKvgAQUrMS68j9IkivWTFRIpdvc14gvTuQRMjLIjMrSfRcEPq2vnl9-yq4X9CXwPNEWUmR3Og601MfR7galBSjj2KA6fenHNtooMarLROi2sxZ73EHaoIsXOR5Ak7_VvoPq3SUV5Y04HY5IXkyA==)

## Unresolved Questions
- Should the platform support live "photo stories" (ephemeral content) similar to Instagram?
- Will the company environment require strictly gated access for all photos, or are there public event tiers?
