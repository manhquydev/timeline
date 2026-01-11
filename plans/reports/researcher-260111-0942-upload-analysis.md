# Detailed Research Report: /upload Page Analysis

## Overview
An in-depth analysis of the current upload system at `/upload`, focusing on UI/UX, Developer Experience, and architectural reliability.

## 1. UX Analysis (User Experience)
- **Cognitive Load**: Multiple `UploadZone` instances on the same page when multiple events are active create confusion.
- **Data Loss Risk**: No protection against accidental navigation while uploading large files.
- **UI Consistency**: Video support is implemented in code but hidden in text guidelines.
- **Feedback Loop**: Auto-refresh happens too fast (1.5s), cutting off the "Success" feeling for the user.

## 2. UI Analysis (User Interface)
- **Mobile First?**: The layout is quite "tall". On mobile, finding the right event to upload to requires significant scrolling.
- **Visual Noise**: Heavy use of GPU-accelerated CSS animations (`backdrop-blur`, `animate-pulse`, `border-dance`) may impact performance on low-end mobile devices (80% of our user base).
- **A11y**: Keyboard navigation support in the custom dropzone is minimal.

## 3. DX Analysis (Developer Experience)
- **Technical Debt**: `upload-zone.tsx` is a "God Component" handling everything from UI to raw network requests.
- **Maintenance**: Validation logic is fragmented across `lib/upload-config.ts` and API routes.
- **Reusability**: `UploadPreviewCard` is underutilized as the main component still contains inline preview logic.

## 4. Architectural Analysis (Workflow)
- **Storage Consistency**: The "Presigned URL -> Upload -> DB Record" flow is fragile. Failure at the DB stage leaves orphaned files in Supabase Storage.
- **Server Load**: The batch upload route `/api/upload` is prone to Vercel timeouts when processing multiple high-resolution images via Sharp.

## Recommendations
1. **Refactor**: Split `upload-zone.tsx` into smaller, functional components and hooks.
2. **Safeguard**: Implement navigation guards and improve error handling/cleanup for storage.
3. **Clarify**: Sync UI text with actual feature support (Videos).
4. **Optimize**: Limit animation complexity on mobile and improve the event selection flow.

## Unresolved Questions
1. Should we move image processing to a background worker?
2. Is a single-page list the best way to handle multiple open events?
3. Can we unify validation schemas using Zod for both client and server?
