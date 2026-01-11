---
title: "Upload Page Redesign - Bottom Sheet Mobile-First"
description: "Redesign /upload with bottom sheet flow, modular components (<200 lines each), optimized for 80% mobile users"
status: completed
priority: P1
effort: 12h
branch: main
tags: [upload, mobile-first, bottom-sheet, refactor, ux]
created: 2026-01-11
completed: 2026-01-11
---

# Upload Page Redesign - Bottom Sheet (Mobile-First)

## Problem Statement

1. **upload-zone.tsx is 755 lines** - violates single responsibility, hard to maintain
2. **Complex workflow** - current flow shows all events at once, overwhelming on mobile
3. **Poor mobile UX** - 80% users on mobile, but UI optimized for desktop

## Solution Overview

Redesign upload experience using **Bottom Sheet pattern** (like Instagram/TikTok):
- Step-by-step guided flow
- Each component < 200 lines
- Mobile-first, touch-optimized
- Keep existing upload logic (direct-upload.ts)

---

## Current Architecture Analysis

### Files to Refactor

| File | Lines | Action |
|------|-------|--------|
| `components/upload/upload-zone.tsx` | 755 | **Split into 6 modules** |
| `app/upload/page.tsx` | 127 | Refactor to use new flow |

### Files to Keep (Already Modular)

| File | Lines | Status |
|------|-------|--------|
| `upload-progress-ring.tsx` | 87 | Keep as-is |
| `upload-success-animation.tsx` | 80 | Keep as-is |
| `upload-preview-card.tsx` | 116 | Keep as-is |
| `lib/supabase/direct-upload.ts` | 392 | Keep as-is |
| `lib/upload-config.ts` | 242 | Keep as-is |
| `components/media/image-editor.tsx` | 321 | Keep as-is |

### Existing Sheet Component

`components/ui/sheet.tsx` already supports `side="bottom"` with rounded corners.

---

## New Component Architecture

```
components/upload/
├── upload-bottom-sheet.tsx      # Main container, step management (~180 lines)
├── upload-event-picker.tsx      # Step 1: Event selection (~120 lines)
├── upload-media-picker.tsx      # Step 2: Dropzone + Camera (~150 lines)
├── upload-media-preview.tsx     # Step 3: Preview grid (~140 lines)
├── upload-message-input.tsx     # Step 3b: Wish text input (~80 lines)
├── upload-progress-overlay.tsx  # Step 4: Full-screen progress (~100 lines)
├── upload-progress-ring.tsx     # (keep) Progress circle
├── upload-success-animation.tsx # (keep) Confetti effect
├── upload-preview-card.tsx      # (keep) Single file preview
├── hooks/
│   └── use-upload-flow.ts       # State management hook (~120 lines)
└── types.ts                     # Shared types (~40 lines)
```

---

## Bottom Sheet Flow Design

### Step 1: Event Picker
```
┌─────────────────────────────────┐
│  ─────  (drag handle)           │
│                                 │
│  Chọn Sự Kiện                   │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🎉 Sinh Nhật Tháng 1    │    │
│  │    12 ảnh • Đang mở     │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 🎊 Tết Nguyên Đán       │    │
│  │    45 ảnh • Đang mở     │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Step 2: Media Picker
```
┌─────────────────────────────────┐
│  ← Quay lại     Sinh Nhật...    │
│  ─────                          │
│                                 │
│  ┌───────────┐ ┌───────────┐    │
│  │           │ │           │    │
│  │  📷 Chụp  │ │ 🖼 Chọn   │    │
│  │   Ảnh     │ │  Ảnh      │    │
│  └───────────┘ └───────────┘    │
│                                 │
│  Kéo thả ảnh vào đây            │
│  hoặc chọn từ thư viện          │
│                                 │
│  Max 20 files • JPG, PNG, MP4   │
└─────────────────────────────────┘
```

### Step 3: Preview + Message
```
┌─────────────────────────────────┐
│  ← Quay lại     3 ảnh đã chọn   │
│  ─────                          │
│                                 │
│  ┌────┐ ┌────┐ ┌────┐          │
│  │ 📷 │ │ 📷 │ │ 📷 │ + Thêm   │
│  └────┘ └────┘ └────┘          │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Thêm lời nhắn (tuỳ chọn)│    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │    🚀 Tải Lên 3 Ảnh     │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Step 4: Upload Progress (Full Screen Overlay)
```
┌─────────────────────────────────┐
│                                 │
│         ╭───────────╮           │
│         │   67%     │           │
│         │   ◯◯◯     │           │
│         ╰───────────╯           │
│                                 │
│     Đang tải ảnh 2/3...         │
│                                 │
│     ━━━━━━━━━━━░░░░░░           │
│                                 │
└─────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (3h)

#### 1.1 Create shared types
**File:** `components/upload/types.ts`

```typescript
export interface UploadEvent {
  id: string
  title: string
  slug: string
  total_photos: number
  status: 'open' | 'closed'
}

export interface FileWithPreview extends File {
  preview: string
  id: string // unique id for React keys
}

export type UploadStep = 'event' | 'media' | 'preview' | 'uploading' | 'success'

export interface UploadFlowState {
  step: UploadStep
  selectedEvent: UploadEvent | null
  files: FileWithPreview[]
  wishText: string
  uploadProgress: number
  fileProgress: DirectUploadProgress[]
}
```

#### 1.2 Create state management hook
**File:** `components/upload/hooks/use-upload-flow.ts`

Responsibilities:
- Manage step navigation
- File validation (reuse from upload-config.ts)
- Progress tracking
- Integration with smartUpload from direct-upload.ts

#### 1.3 Create upload-bottom-sheet container
**File:** `components/upload/upload-bottom-sheet.tsx`

Responsibilities:
- Render Sheet with side="bottom"
- Step routing based on state
- Handle sheet open/close
- Pass props to step components

---

### Phase 2: Step Components (5h)

#### 2.1 Event Picker (1h)
**File:** `components/upload/upload-event-picker.tsx`

Features:
- List open events with stats
- Touch-friendly cards (min 48px height)
- Scroll if many events
- Empty state if no events

#### 2.2 Media Picker (1.5h)
**File:** `components/upload/upload-media-picker.tsx`

Features:
- Camera button (mobile only, capture="environment")
- Gallery button / Dropzone
- Drag & drop zone (desktop)
- File validation feedback
- Accept: images + videos

#### 2.3 Media Preview Grid (1.5h)
**File:** `components/upload/upload-media-preview.tsx`

Features:
- Grid of selected files (2 cols mobile, 4 cols desktop)
- Remove file button
- Edit button (images only) - opens ImageEditor
- Add more files button
- File count + total size display

#### 2.4 Message Input (0.5h)
**File:** `components/upload/upload-message-input.tsx`

Features:
- Textarea with character count (max 500)
- Optional label
- Mobile-optimized keyboard handling

#### 2.5 Progress Overlay (0.5h)
**File:** `components/upload/upload-progress-overlay.tsx`

Features:
- Full-screen overlay with blur backdrop
- Central UploadProgressRing
- Status message
- File-by-file progress
- Success animation trigger

---

### Phase 3: Integration (2.5h)

#### 3.1 Update /upload page (1h)
**File:** `app/upload/page.tsx`

Changes:
- Replace inline UploadZone with UploadBottomSheet trigger
- FAB button to open sheet
- Pass events to bottom sheet

#### 3.2 Update event page upload dialog (0.5h)
**File:** `app/events/[slug]/page.tsx`

Changes:
- Replace Dialog with UploadBottomSheet
- Pre-select current event (skip step 1)

#### 3.3 Update StickyUploadFab (0.5h)
**File:** `components/events/sticky-upload-fab.tsx`

Changes:
- Use UploadBottomSheet instead of Dialog
- Pre-select event

#### 3.4 Deprecate old upload-zone.tsx (0.5h)
- Add deprecation comment
- Keep for rollback if needed
- Remove after 1 sprint of stable usage

---

### Phase 4: Polish & Testing (1.5h)

#### 4.1 Animations & Transitions (0.5h)
- Smooth step transitions
- Swipe gestures for back navigation
- Spring animations for sheet

#### 4.2 Error Handling (0.5h)
- Network error recovery
- Partial upload success handling
- Retry failed files

#### 4.3 Accessibility (0.5h)
- Focus management between steps
- Screen reader announcements
- Keyboard navigation

---

## Component Specifications

### upload-bottom-sheet.tsx (~180 lines)

```typescript
interface UploadBottomSheetProps {
  events: UploadEvent[]
  preSelectedEventId?: string // Skip step 1 if provided
  trigger?: React.ReactNode
  onComplete?: () => void
}
```

Key features:
- Uses Sheet from ui/sheet.tsx with side="bottom"
- Dynamic height based on step content
- Drag handle for mobile
- Back button in header

### upload-event-picker.tsx (~120 lines)

```typescript
interface EventPickerProps {
  events: UploadEvent[]
  onSelect: (event: UploadEvent) => void
}
```

### upload-media-picker.tsx (~150 lines)

```typescript
interface MediaPickerProps {
  onFilesSelected: (files: File[]) => void
  currentCount: number
  maxFiles: number
}
```

### upload-media-preview.tsx (~140 lines)

```typescript
interface MediaPreviewProps {
  files: FileWithPreview[]
  onRemove: (id: string) => void
  onEdit: (file: FileWithPreview) => void
  onAddMore: () => void
  disabled?: boolean
}
```

### upload-message-input.tsx (~80 lines)

```typescript
interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
}
```

### upload-progress-overlay.tsx (~100 lines)

```typescript
interface ProgressOverlayProps {
  show: boolean
  progress: number
  status: string
  fileProgress: DirectUploadProgress[]
  onSuccess?: () => void
}
```

---

## Migration Strategy

### Backward Compatibility

1. Keep old `upload-zone.tsx` temporarily
2. New components use same APIs:
   - Same `smartUpload` from direct-upload.ts
   - Same validation from upload-config.ts
   - Same Supabase storage paths

### Feature Flags (Optional)

```typescript
// lib/feature-flags.ts
export const FEATURES = {
  USE_BOTTOM_SHEET_UPLOAD: true, // Toggle new UI
}
```

### Rollback Plan

If issues found:
1. Set `USE_BOTTOM_SHEET_UPLOAD: false`
2. Old upload-zone.tsx still works
3. Fix issues in new components
4. Re-enable flag

---

## Success Criteria

### Functional
- [ ] All 4 steps work correctly
- [ ] Upload succeeds with same reliability as before
- [ ] Video upload works
- [ ] Image editing works
- [ ] Progress tracking accurate

### Performance
- [ ] No regression in upload speed
- [ ] Smooth 60fps animations
- [ ] < 100ms step transitions

### UX
- [ ] Touch targets >= 44px
- [ ] Swipe back gesture works
- [ ] Clear visual feedback at each step
- [ ] Error states are helpful

### Code Quality
- [ ] Each component < 200 lines
- [ ] No prop drilling > 2 levels
- [ ] Types exported from types.ts
- [ ] Reuses existing utilities

---

## File Checklist

### Create New Files

- [x] `components/upload/types.ts` - 110 lines
- [x] `components/upload/hooks/use-upload-flow.ts` - 195 lines
- [x] `components/upload/upload-bottom-sheet.tsx` - 178 lines
- [x] `components/upload/upload-event-picker.tsx` - 98 lines
- [x] `components/upload/upload-media-picker.tsx` - 136 lines
- [x] `components/upload/upload-media-preview.tsx` - 130 lines
- [x] `components/upload/upload-message-input.tsx` - 52 lines
- [x] `components/upload/upload-progress-overlay.tsx` - 108 lines

### Modify Existing Files

- [x] `app/upload/page.tsx` - Use new UploadBottomSheet
- [x] `app/events/[slug]/page.tsx` - Replace Dialog with UploadBottomSheet
- [x] `components/events/sticky-upload-fab.tsx` - Use UploadBottomSheet

### Deprecate (After Stabilization)

- [ ] `components/upload/upload-zone.tsx` - Mark deprecated, remove later

---

## Unresolved Questions

1. **Swipe gestures**: Use native Sheet behavior or add react-swipeable?
2. **Sheet height**: Fixed heights per step or dynamic based on content?
3. **Video preview**: Auto-play on hover or static thumbnail?
4. **Multi-event upload**: Allow uploading to multiple events in one session?

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Foundation | 3h | None |
| Phase 2: Step Components | 5h | Phase 1 |
| Phase 3: Integration | 2.5h | Phase 2 |
| Phase 4: Polish | 1.5h | Phase 3 |
| **Total** | **12h** | - |

---

## References

- Instagram upload flow
- TikTok creation flow
- Radix UI Sheet component
- Existing `lib/supabase/direct-upload.ts`
- Existing `lib/upload-config.ts`
