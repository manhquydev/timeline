# Refactor Plan: Upload System Optimization

## Goal
Improve UI/UX, Developer Experience (DX), and reliability of the `/upload` page and its underlying systems.

## 1. Component Refactoring (DX)
- **Problem**: `upload-zone.tsx` is a "fat" component (~750 lines).
- **Solution**:
    - Extract state management and upload logic into a custom hook `useUploadZone`.
    - Extract UI sections into sub-components:
        - `UploadGuidelines`: The alert box with tips.
        - `FilePreviewGrid`: Using the existing `UploadPreviewCard`.
        - `UploadDropzone`: The interactive drop/click area.
        - `UploadActions`: The bottom buttons and wish text input.
    - Path: `components/upload/`

## 2. UI/UX Improvements
- **Problem**: Conflict between multiple events, lack of navigation warnings, unclear video support.
- **Solution**:
    - **Navigation Guard**: Add a `useEffect` with `beforeunload` event listener and Next.js router guard to prevent data loss during upload.
    - **Video Support**: Update `UI_TEXT.UPLOAD_TIPS` and `UploadZone` UI to explicitly mention video support (size limits, formats).
    - **Event Selection**: If multiple events are open, consider a simplified "Event Selector" dropdown or tab system instead of rendering multiple full `UploadZone` components.
    - **Success UX**: Increase auto-refresh delay from 1.5s to 3s to allow users to see the success state.

## 3. Workflow & Reliability
- **Problem**: Potential for orphan files in Supabase Storage if MongoDB record creation fails.
- **Solution**:
    - **Atomic-like Operations**: Improve error handling in `directUpload` to attempt cleanup of Storage if the final database step fails.
    - **Client-side Retries**: Implement a more robust retry mechanism for failed individual files in the preview grid.
    - **Broadcasting Logic**: Move broadcasting logic into the `useUploadZone` hook or a dedicated service to keep UI clean.

## 4. Performance & Validation
- **Problem**: Heavy UI effects on mobile, synchronous image processing in `/api/upload`, duplicate validation logic.
- **Solution**:
    - **Performance Toggles**: Reduce animation complexity (e.g., `border-dance`, `gradient-shift`) on mobile devices or via a "Low Power" detection.
    - **Unified Validation**: Move common validation rules to a shared utility that both Zod (server) and the client config can use to ensure consistency.
    - **Server Optimization**: Consider offloading Sharp processing to an Edge Function or background task to avoid Vercel timeouts for large batches.

## 5. Accessibility (A11y)
- **Problem**: Custom dropzone lacks proper focus management and keyboard interaction.
- **Solution**: Add `tabIndex`, `onKeyDown`, and proper ARIA labels to the dropzone and interactive preview cards.

## Implementation Steps
1. Create `useUploadZone` hook.
2. Split `upload-zone.tsx` into sub-components.
3. Integrate `beforeunload` guard.
4. Update `UPLOAD_LIMITS` and `UI_TEXT` for video support.
5. Test with multiple open events.
