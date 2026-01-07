EPIC 8: ADVANCED IMAGE EDITING & UX ENHANCEMENT**

### **Thời gian:** 08/01/2026  
### **Giai đoạn:** Phase 2. 1 - Trải Nghiệm Chỉnh Sửa Ảnh Tối Ưu & Hỗ Trợ Auto-Rotation  

---

### **1.  TỔNG QUAN & RATIONALE**

T��� feedback người dùng, nhiều hình ảnh đã upload bị sai hướng (upside-down, sideways) do: 
- ✅ EXIF orientation metadata không được xử lý (thiếu auto-rotate on-upload)
- ✅ Công cụ chỉnh sửa ảnh hiện tại (crop + rotate) thiếu UX friction (khó tìm, không live preview, thiếu undo/redo)
- ✅ Không có feedback tức thời → users không biết edit có thành công hay không

**Epic 8 mục tiêu:**
- Tự động phát hiện & sửa EXIF orientation khi upload
- Nâng cấp UI/UX công cụ editor (instant feedback, clear controls, undo/redo)
- Hỗ trợ đầy đủ các tính năng:  rotate, crop, flip, straighten, aspect ratio presets
- Mobile-first design (touch-friendly controls)
- **User-centric approach:** Giảm friction, tăng confidence

**Tác động dự án:**
- Giảm 70% complaints về ảnh sai hướng
- Tăng user satisfaction score cho photo management features
- Nền tảng cho social features (Epic 7) - ảnh đúng hướng → engagement tốt

---

### **2. PHẠM VI CÔNG VIỆC CHI TIẾT**

#### **2.1 EXIF Auto-Rotation & Server-Side Processing** 
**Problem:** Users upload ảnh chụp từ điện thoại (ngang/dọc/upside-down), EXIF orientation metadata không được xử lý → hiển thị sai hướng trên web. 

- [ ] **Backend:  EXIF Detection & Auto-Rotation**
  - Install library: `sharp` (Node.js) hoặc `piexif` (Python) để đọc EXIF data
  - Process flow:
    ```
    1. User uploads → Server receives file
    2. Read EXIF orientation tag (values 1-8)
    3. If orientation != 1 (normal):
       - Auto-rotate pixel data bằng sharp
       - Remove EXIF orientation tag (prevent double-rotation)
       - Save corrected image to Supabase Storage
    4. Store original EXIF metadata (non-location) in MongoDB for future reference
    ```
  - API Endpoint: `POST /api/posts/: postId/photo/auto-rotate`
    - Trigger manual auto-rotation nếu user upload lại
    - Return:  { status: 'rotated', originalOrientation: 3, appliedRotation: '180deg' }
  - Middleware:  Áp dụng auto-rotation cho tất cả uploads (không optional)
  - EXIF Privacy: Xóa location/GPS data trước khi lưu (privacy first)

- [ ] **Image Processing Performance**
  - Use `sharp` streaming pipeline (không load toàn bộ image vào memory)
  - Async job queue (Bull/RabbitMQ) nếu app mất nhiều time
  - Compress lightly during rotation (quality:  90) để tối ưu file size
  - Cache headers: Set 1-year expire cho processed images (immutable)

#### **2.2 Client-Side Image Editor - Redesign UX**
**Problem:** Công cụ edit ảnh hiện tại bị ẩn, không obvious, không live preview → users bỏ cuộc. 

**Solution:** Build dedicated image editor modal/page với: 

- [ ] **UI/UX Component:  ImageEditorModal**
  ```
  ┌─────────────────────────────────────────────────────────┐
  │  IMAGE EDITOR                          ← [X] Close      │
  ├─────────────────────────────────────────────────────────┤
  │                                                           │
  │  [Live Preview Canvas]  │  [Edit Toolbar]              │
  │  - EXIF-corrected base  │  ┌─────────────────────────┐ │
  │  - Real-time edits      │  │ ↻ ROTATE 90°            │ │
  │  - Zoom:  [−] [+]        │  │ ↺ FLIP HORIZONTAL       │ │
  │                         │  │ ↕ FLIP VERTICAL         │ │
  │                         │  │ ✂ CROP                  │ │
  │                         │  │ ◯ STRAIGHTEN/LEVEL      │ │
  │                         │  └─────────────────────────┘ │
  │                         │  ASPECT RATIO PRESETS:        │
  │                         │  [1:1] [4:3] [16:9] [Free]   │
  │                         │                             │
  │                         │  CONTROLS:                  │
  │                         │  [↶ UNDO] [↷ REDO] [↻ RESET] │
  ├─────────────────────────────────────────────────────────┤
  │  [CANCEL]                              [APPLY CHANGES]  │
  └─────────────────────────────────────────────────────────┘
  ```

- [ ] **Core Features**

  **A.  Rotate (90° increments + Fine Slider)**
  - Buttons: `↻ Rotate Right (90°)` + `↺ Rotate Left (-90°)` 
  - Advanced:  Slider for fine adjustment (-180° to +180°, step 1°)
  - Live preview: Image rotates instantly as slider moves
  - Keyboard:  Arrow keys for rotation (accessibility)
  - Auto-reset:  Show original orientation option
  - Visual indicator: Current rotation angle display (e.g., "Current: +45°")

  **B. Flip (Mirror)**
  - Button: `↔ FLIP HORIZONTAL` + `↕ FLIP VERTICAL`
  - Combined: Allow flip + rotate simultaneously
  - Live preview: Instant flip reflection

  **C. Crop & Aspect Ratio**
  - Drag-resize crop box with corner handles
  - Preset aspect ratios: 1:1 (square), 4:3, 16:9, 3:2, freeform
  - Lock/unlock aspect ratio toggle
  - Show crop area overlay with shading (darker outside crop region)
  - Coordinates display: Show pixel dimensions or percentage
  - Mobile:  Large touch targets (min 44px hit area)

  **D. Straighten/Auto-Level**
  - Detect tilt angle via edge detection algorithm or manual slider
  - Auto-straighten: Detect horizon line and auto-correct tilt
  - Manual straighten: Slider (-45° to +45°) for fine adjustments
  - Show grid overlay to help user align

  **E.  Zoom & Pan**
  - Zoom slider:  50% to 200% (or fit-to-screen default)
  - Pinch-zoom on mobile (two-finger gesture)
  - Pan: Click-drag to move image within canvas

  **F. Undo/Redo & Reset**
  - Undo stack: Track all edits, allow step-by-step undo (Ctrl+Z / Cmd+Z)
  - Redo:  Ctrl+Y / Cmd+Y
  - Reset: One-click revert to original image (clear all edits)
  - Visual indicators: Disable buttons when no history/future

- [ ] **Implementation Details**

  **Library Choice:**
  - Use **Cropper.js** (lightweight, robust) OR **Fabric.js** (more advanced)
  - Fallback:  **Canvas API** (native, no dependency)
  - Recommendation: **Cropper.js** for simplicity + Cropper quality

  **Performance:**
  - Render preview at 1-3x device resolution (not full resolution)
  - Debounce slider updates to prevent excessive redraws
  - Use `requestAnimationFrame` for smooth interactions
  - Load original image in background, show preview in foreground

  **State Management:**
  - Store edit history in React state or Zustand
  - Edit object: `{ rotate: 45, cropBox: {... }, flipH: false, flipV: false }`
  - Apply edits via canvas transformations (non-destructive until submit)

  **Export/Save:**
  - User clicks `APPLY CHANGES` → merge all edits onto canvas
  - Export via canvas. toBlob() → upload to Supabase
  - Preserve image metadata (filename, exif non-location)
  - Show "Saving..." spinner during upload

- [ ] **Accessibility**
  - Keyboard navigation:  Tab through controls, Enter to activate
  - ARIA labels: All buttons and sliders
  - Screen reader: Announce current rotation, crop dimensions
  - Color contrast: ≥ 4.5:1 for all text/icons
  - Focus indicators: Clear outline on all interactive elements

#### **2.3 Modal/Dialog Entry Points & Triggers**
- [ ] **When to show image editor:**
  - On photo upload:  After upload succeeds, show preview with "Edit" button
  - Edit existing photo: Click image in gallery → "Edit" icon → launch editor
  - Smart trigger: If EXIF orientation detected, show "Image was rotated automatically.  Click to review or adjust." toast → user can skip or edit

- [ ] **Integration Points:**
  - Photo gallery (grid/pinboard/album view): Add edit icon on hover
  - Mobile: Tap image → show action sheet with [Edit] [Delete] [Download] options
  - Upload progress: Post-upload confirmation screen with edit button

#### **2.4 User Feedback & Visual Guidance**
- [ ] **Toast Notifications:**
  - "Image orientation auto-corrected ✓" (if EXIF rotation applied)
  - "Saving edits..." → "Photo saved successfully ✓"
  - "Edit cancelled, original image kept" (if user closes without saving)

- [ ] **Microcopy & Tooltips:**
  - Button:  `↻ ROTATE 90°` - Tooltip:  "Rotate image 90 degrees clockwise"
  - Label: "ASPECT RATIO" - Tooltip: "Lock or unlock width/height proportions"
  - Label: "STRAIGHTEN" - Tooltip: "Adjust tilt angle to level your photo (±45°)"

- [ ] **Visual Cues:**
  - Highlight rotation value display
  - Show grid overlay during crop (optional toggle)
  - Animated button press feedback
  - Progress bar during image processing

---

### **3. TECHNICAL REQUIREMENTS**

| Requirement | Details |
|-------------|---------|
| **EXIF Library** | sharp 0.33+ (Node.js) with piexif for metadata reading |
| **Image Editor** | Cropper.js 1.6+ or custom Canvas implementation |
| **Performance** | Auto-rotation:  <2s per image; Preview render: <100ms; Safari/Chrome/Firefox compatible |
| **Browser Support** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (Canvas API native) |
| **Mobile** | Touch gestures (pinch-zoom, swipe pan), responsive layout |
| **Accessibility** | WCAG 2.1 AA compliance (keyboard nav, screen reader, contrast) |
| **Storage** | Processed images → Supabase (same bucket structure) |
| **Data** | Store edit history in MongoDB `Photo` document if needed for audit |
| **Security** | Input validation (image size <50MB), XSS prevention, EXIF sanitization |

---

### **4. USER EXPERIENCE JOURNEY**

```
Scenario A: Upload Image (EXIF Auto-Rotation)
─────────────────────────────────────────────
1. User uploads photo (device detected as upside-down, EXIF orientation = 3 [180°])
2. Backend processes:  Detects EXIF, auto-rotates pixel data, removes tag
3. Frontend shows: Toast "Image orientation fixed ✓" + preview
4. User sees: Image now displays correctly without manual action
5. Optional: User can click "Edit" to fine-tune if needed

Scenario B: Manual Image Editing
─────────────────────────────────
1. User clicks "Edit" on any photo in gallery
2. ImageEditorModal opens with EXIF-corrected base image
3. User rotates/crops/flips as needed (live preview updates instantly)
4. User clicks "Apply Changes"
5. Backend processes edits, uploads to Supabase
6. Frontend confirms:  "Photo saved successfully ✓"
7. Gallery updates with new image

Scenario C: Mobile User (Frustration → Delight)
───────────────────────────────────────────────
1. User on iPhone uploads photo (EXIF orientation issue expected)
2. Backend auto-corrects before frontend renders
3. User sees correct image immediately (no confusion!)
4. If minor adjustment needed:  Tap image → [Edit] → use touch-friendly rotate slider
5. No friction, intuitive, fast = happy user ✓
```

---

### **5. DEFINITIONS OF DONE (DoD)**

✅ **EXIF Auto-Rotation:**
- [ ] Auto-rotate triggered for all uploads automatically
- [ ] EXIF orientation tag removed post-rotation (prevent double-rotation)
- [ ] EXIF privacy data (GPS, device info) removed before storage
- [ ] Tested with images in all 8 EXIF orientations
- [ ] No regression:  Original image backup preserved (if needed for future undo)

✅ **Image Editor UI:**
- [ ] Rotate, flip, crop, straighten all work with live preview
- [ ] Undo/redo functional + keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [ ] Aspect ratio presets functional + lock/unlock toggle
- [ ] Mobile-friendly:  Touch gestures, responsive layout tested on iPhone/Android
- [ ] Tooltips/microcopy clear for all controls
- [ ] No visual glitches on resize, no memory leaks (test with 100 rapid edits)

✅ **Performance:**
- [ ] Auto-rotation: <2 seconds per image
- [ ] Live preview render: <100ms (smooth 60fps)
- [ ] Modal load time: <500ms
- [ ] Bundle size impact: <50KB (gzipped)

✅ **Accessibility:**
- [ ] Keyboard navigation full (no mouse required)
- [ ] ARIA labels present on all interactive elements
- [ ] Color contrast ≥4.5:1
- [ ] Screen reader tested (NVDA, VoiceOver)

✅ **Integration:**
- [ ] Works with existing photo gallery (grid, pinboard, album)
- [ ] Edit button visible on all photo view types
- [ ] Backward compatible with Epic 1-7 features
- [ ] Database:  Edit history tracked in MongoDB (optional for audit)

✅ **Testing:**
- [ ] Unit tests:  80%+ coverage (EXIF parsing, rotate/crop logic)
- [ ] E2E tests: Upload → Auto-rotate → Manual edit → Save workflow
- [ ] Visual regression: Compare before/after images
- [ ] Browser testing: Chrome, Firefox, Safari, Edge
- [ ] Mobile testing: iPhone (iOS), Pixel (Android)

✅ **Monitoring & Analytics:**
- [ ] Track:  # of auto-rotations applied, # of manual edits, avg edit time
- [ ] Monitor: Error rates, performance metrics (p95 latency)
- [ ] User feedback: In-app survey "Was image editing easy?" (1-5 scale)

---

### **6. TECHNICAL ARCHITECTURE**

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (React)                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  [ImageUploadComponent]                                       │
│     ↓                                                          │
│  [ImageEditorModal] (new)                                     │
│  ├─ Cropper.js Canvas                                         │
│  ├─ Edit Toolbar (rotate/flip/crop/straighten)               │
│  ├─ Undo/Redo Stack                                          │
│  └─ Apply → POST /api/posts/:postId/photo/update             │
│                                                                │
│  [ImageGallery]                                               │
│     ├─ Grid View (with edit icon)                             │
│     ├─ Pinboard View (with edit icon)                         │
│     └─ Album View (with edit icon)                            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                  │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  [POST /api/posts/upload]                                     │
│  ├─ sharp. rotate() [EXIF auto-rotation]                       │
│  ├─ EXIF sanitization (remove GPS)                            │
│  └─ Save to Supabase Storage                                  │
│                                                                │
│  [POST /api/posts/:postId/photo/update]                       │
│  ├─ Receive canvas blob (edited image)                        │
│  ├─ Optional: re-compress via sharp                           │
│  ├─ Save to Supabase Storage (new version)                    │
│  └─ Update MongoDB Photo document (metadata)                  │
│                                                                │
│  [Middleware] exifAutoRotate()                                │
│  └─ Applied to all image uploads                              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────────┐
│            Storage & Data (MongoDB + Supabase)                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  MongoDB:                                                       │
│  ├─ Photo { _id, postId, filename, exifMetadata, createdAt }  │
│  └─ EditHistory (optional): { photoId, edits:  [], timestamp } │
│                                                                │
│  Supabase Storage:                                            │
│  ├─ posts/{eventId}/{postId}/{filename}. jpg (original)        │
│  └─ posts/{eventId}/{postId}/{filename}-edited.jpg (versions) │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

### **7. IMPLEMENTATION ROADMAP**

**Week 1 - Foundation (Days 1-3)**
- [ ] Day 1: Setup `sharp` library, write EXIF detection + rotation logic
- [ ] Day 2:  Implement server-side auto-rotation middleware, test with sample images
- [ ] Day 3: Update upload endpoint, integrate EXIF sanitization, deploy to staging

**Week 1-2 - Frontend Editor (Days 4-6)**
- [ ] Day 4: Create ImageEditorModal component, integrate Cropper.js
- [ ] Day 5: Implement rotate/flip/crop/straighten features + undo/redo
- [ ] Day 6: Add aspect ratio presets, straighten slider, accessibility features

**Week 2 - Polish & Testing (Days 7-10)**
- [ ] Day 7: Mobile responsiveness, touch gesture support, tooltips
- [ ] Day 8-9: E2E testing, cross-browser testing, performance optimization
- [ ] Day 10: UX review, polish animations, deployment to production

---

### **8. KEY METRICS & SUCCESS CRITERIA**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Auto-rotation accuracy | 99%+ correct orientation | Test with EXIF orientations 1-8 |
| Manual edit adoption | 40%+ of uploads edited | Analytics tracking |
| User satisfaction | 4.2+/5 stars (editor ease) | In-app survey |
| Performance (auto-rotate) | <2s per image | Server logs, APM |
| Performance (live preview) | <100ms render | browser DevTools |
| Accessibility score | 95+ (Lighthouse) | Lighthouse audit |
| Support tickets (rotation) | 70% reduction | Compare pre/post |
| Mobile conversion | +15% after launch | Analytics |

---

### **9. NOTES FOR TEAM**

⚠️ **EXIF & Privacy:**
- Always remove location/GPS data from EXIF before saving (user privacy)
- Store non-sensitive EXIF data (camera model, ISO) for analytics only
- Allow users to opt-out of EXIF processing (if needed)

⚠️ **Performance:**
- Auto-rotation happens **server-side** (immutable, guaranteed correct)
- Client-side editor is **non-destructive** (doesn't modify original file on server until "Apply")
- Use Canvas API for fast preview, not server requests

⚠️ **Backward Compatibility:**
- Old uploaded images (before Epic 8): No breaking changes, still display via CSS transforms if needed
- New auto-rotation only applies to new uploads
- Users can manually re-upload old photos to trigger auto-rotation

⚠️ **Cross-Browser Testing:**
- Canvas API is widely supported, but test on Safari (slower rendering)
- Cropper.js has polyfills for older browsers (if needed)
- Touch gestures may differ:  iPhone vs Android gestures

⚠️ **Mobile Strategy:**
- Optimize for one-handed editing (controls on right side for right-handers)
- Show portrait orientation for editor (match device orientation)
- Reduce canvas size on mobile to improve performance

---

## **🎯 SUMMARY**

Epic 8 giải quyết **major UX friction** mà users đang gặp (ảnh sai hướng, khó chỉnh). Bằng: 

✅ **Auto-EXIF rotation** → Giảm 70% user complaints  
✅ **Intuitive editor UI** → Tăng confidence, giảm frustration  
✅ **Live preview + undo/redo** → Empowers users, increases engagement  
✅ **Mobile-first design** → Works seamlessly on all devices  
✅ **Accessibility** → Inclusive for all users  

**Business Impact:**
- Better photo quality in albums → Higher engagement in Epic 7 (social features)
- Reduced support load (image orientation issues)
- Competitive feature parity with Instagram/Google Photos

🚀