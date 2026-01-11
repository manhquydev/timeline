# Implementation Plan: Mobile Image Editor Integration

**Project:** Company Memory Timeline
**Target:** Next.js 15 + MongoDB + Supabase
**Library Choice:** Filerobot Image Editor (Open Source / MIT)

## 1. Setup & Installation
- Install dependencies: `npm install @scaleflex/filerobot-image-editor react-konva konva styled-components`
- Note: Next.js 15 requires "use client" for these components as they rely on browser APIs (Canvas).

## 2. Component Architecture
- Create a dedicated component: `@/components/editor/ImageEditor.tsx`
- **Props:**
  - `src`: The image URL or Blob to edit.
  - `onSave`: Callback receiving the edited Blob/Base64.
  - `onCancel`: Close the editor.

## 3. Integration with Upload Flow
- **Current Flow:** User selects photo -> Preview -> Upload API.
- **Enhanced Flow:**
  1. User selects photo.
  2. Open `ImageEditor` modal.
  3. User crops/filters/adds text.
  4. User clicks "Save" -> Editor returns a compressed Blob.
  5. Pass the *edited* Blob to the existing `/api/upload` endpoint.

## 4. Mobile UX Optimization
- **Full-screen Modal:** The editor should occupy 100% of the viewport on mobile.
- **Tool Selection:** Focus on a bottom-tab navigation for tools (Crop, Filter, Adjust, Annotate).
- **Gesture Support:** Enable pinch-to-zoom and two-finger rotation if supported by Filerobot.

## 5. Performance Strategy
- **Web Worker:** Offload image compression to a background thread if possible.
- **Initial Resize:** If the original photo is > 4000px, resize to ~2000px using an offscreen canvas BEFORE passing it to the editor to prevent mobile browser crashes.
- **Lazy Loading:** Dynamically import the editor component to avoid bloating the main bundle.
  ```typescript
  const ImageEditor = dynamic(() => import('@/components/editor/ImageEditor'), { ssr: false });
  ```

## 6. Detailed Task List
1. [ ] Create `@/components/editor/ImageEditor.tsx` wrapper.
2. [ ] Configure Filerobot themes to match Teky brand (Purple/Primary).
3. [ ] Implement `onSave` logic to convert Canvas to Blob.
4. [ ] Integrate editor into the photo upload button/form.
5. [ ] Test on real mobile devices (iOS/Android) for touch responsiveness.

## 7. Risks & Mitigation
- **Bundle Size:** Filerobot is large (~200KB). Mitigation: Dynamic imports and code splitting.
- **Memory Usage:** Mobile browsers may kill the tab if editing multiple high-res photos. Mitigation: Force resize to 2MP (1600x1200) for processing.
- **Next.js 15 Compatibility:** Ensure `styled-components` and `react-konva` are compatible with the latest React 19/Next 15 ecosystem.
