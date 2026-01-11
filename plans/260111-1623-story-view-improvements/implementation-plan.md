# Implementation Plan: StoryReelTimeline UX Improvements

To align the current `StoryReelTimeline` with industry-standard Instagram/TikTok UX patterns, we need to transition from "Event-only" navigation to "Post-within-Event" navigation with proper gesture handling.

## Proposed Changes

### 1. State Management Upgrades
- Add `currentPostIndex` to track the specific photo/video being viewed within an event.
- Reset `currentPostIndex` to 0 when switching events.

### 2. Segmented Progress Bar
- Refactor the progress bar to show multiple segments per event (one per post).
- Visual: Active post segment fills up over 5-15s; previous posts stay full; future posts stay empty.

### 3. Gesture Navigation Mapping
- **Tap Right (75%):** Next Post. If at last post, go to Next Event.
- **Tap Left (25%):** Previous Post. If at first post, go to Previous Event.
- **Vertical Swipe (Current):** Keep for switching between Events (TikTok style).
- **Horizontal Swipe (Optional):** Could be used for switching Events (Instagram style) if vertical is reserved for discovery.

### 4. Auto-Advance & Interactivity
- Implement a `useInterval` hook for auto-advancing posts.
- Add `onMouseDown`/`onPointerDown` to pause the timer (Long Press).
- Ensure the progress bar animation pauses/resumes in sync with the timer.

### 5. Media Preloading
- Utilize the `OptimizedImage` component to preload the `currentPostIndex + 1` media.
- For videos, initialize the next video element in a hidden state to minimize buffering.

## Technical Tasks
- [ ] Modify `StoryReelTimeline.tsx` props to handle nested post state.
- [ ] Create a `StoryProgressBar` sub-component.
- [ ] Update `handleDragEnd` and tap zone logic.
- [ ] Integrate `useLoadingStore` for smooth transitions between events.

## File Paths
- Component: `D:/project/timeline/components/timeline/story-reel-timeline.tsx`
- Research: `D:/project/timeline/plans/260111-1623-story-view-improvements/research/researcher-01-instagram-stories-ux.md`
- Plan: `D:/project/timeline/plans/260111-1623-story-view-improvements/implementation-plan.md`
