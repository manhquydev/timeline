# Research Report: React Image Editor Libraries (2024-2025)

**Date:** 2026-01-11
**Target Platform:** Next.js 15 (Mobile-first, 80% mobile users)
**Requirements:** Crop, rotate, filters, brightness/contrast, text overlay, stickers.

## Comparison Table

| Library | Bundle Size (Gzip) | Features | Mobile Support | Last Update | License | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pintura** | ~40-60 KB (Tree-shakable) | Full (Crop, rotate, filters, stickers, text, AI bg removal) | Excellent (Native feel) | Oct 2025 | Commercial | Best for Pro UX |
| **Filerobot** | ~150-200 KB (Full) | Full (Crop, filters, shapes, text, watermark) | Good | Dec 2025 | MIT | Best Open Source |
| **react-image-crop**| < 5 KB | Crop only | Good | Oct 2025 | ISC | Best for lightweight |
| **react-cropper** | ~30 KB (Cropper.js) | Crop, rotate, zoom | Fair (Heavy) | 2023 (Legacy) | MIT | Not recommended |
| **Konva / react-konva**| ~40 KB | Canvas engine (Build your own) | Excellent | Active | MIT | Best for Custom |
| **Fabric.js** | ~80 KB | Canvas engine (Object-oriented) | Fair | Active | MIT | Complex mobile UX |
| **TUI.Image-Editor**| ~200+ KB | Full (Filters, text, icons, crop) | Poor | 2022 (Stale) | MIT | Outdated |

## Technical Analysis

### 1. Instagram Filters: CSS vs. Canvas
*   **CSS Filters (`filter: contrast(1.2) brightness(0.9)`):**
    *   *Pros:* GPU-accelerated, zero JS overhead, perfect for real-time previews.
    *   *Cons:* Non-destructive only, hard to "save" to file without a server or Canvas conversion.
*   **Canvas API (`getImageData` / WebGL):**
    *   *Pros:* Pixel-perfect, "Export to JPEG/PNG" native support, custom LUTs (Look-Up Tables).
    *   *Cons:* Performance hit on mobile if not optimized (use WebGL for heavy filters).

**Recommendation:** Use CSS filters for UI preview, but use Canvas (specifically WebGL for performance) when the user clicks "Save" to bake the filters into the image.

### 2. Performance Tips for Canvas (80% Mobile)
*   **Offscreen Canvas:** Render heavy operations (stickers, text) on an offscreen canvas and use `drawImage` to sync.
*   **Layering:** Keep the base image on one canvas and the "annotations" (stickers/text) on a transparent overlay canvas to avoid redrawing the background 60 times per second.
*   **Downscaling:** Never edit a 20MP photo on a mobile browser. Downscale to 2000px max before processing.

### 3. Mobile UX Best Practices
*   **Touch Targets:** Buttons must be at least 44x44px.
*   **Slider UX:** Use native range inputs or touch-optimized sliders for brightness/contrast.
*   **Pinch-to-Zoom:** Essential for cropping accuracy. `react-easy-crop` or `Pintura` handle this best.

## Final Recommendations

### Top Pick (Open Source): Filerobot Image Editor
*   **Why:** It is the only modern MIT-licensed library that provides a full suite (filters, stickers, text) out of the box without needing to build a UI from scratch.
*   **Caveat:** Ensure you use the tree-shakable version to keep the bundle size manageable.

### Top Pick (Commercial): Pintura
*   **Why:** If the budget allows, Pintura provides a "native app" feel on mobile that is significantly better than any open-source alternative.

### Best for Minimalists: react-image-crop + CSS Filters
*   **Why:** If you only need cropping and basic brightness/contrast, don't ship a 200KB editor. Use `react-image-crop` and simple CSS sliders.

## Sources
- [Pintura Image Editor](https://pqina.nl/pintura/)
- [Filerobot Image Editor GitHub](https://github.com/scaleflex/filerobot-image-editor)
- [React Image Crop GitHub](https://github.com/dominictobias/react-image-crop)
- [Konva JS Performance Tips](https://konvajs.org/docs/performance/Performance_Tips.html)
- [Mobile UX Best Practices 2025](https://wezom.com/blog/mobile-app-design-trends)

## Unresolved Questions
1. Does the project have a budget for a commercial license (Pintura)?
2. Do we need "Stickers" to be custom-uploaded by admins, or just a fixed set of emojis?
3. Should the "Save" action happen client-side or should we send the transformation metadata to a server (Sharp/Node.js) to process the high-res original?
