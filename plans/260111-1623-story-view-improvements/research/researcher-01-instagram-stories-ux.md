# Instagram Stories UX & Implementation Research

## 1. Navigation: Tap vs. Horizontal Swipe
Instagram distinguishes between **intra-user** and **inter-user** navigation using distinct gestures.

*   **Taps (Intra-user):** Used to navigate between slides (media) of the *same* user.
    *   **Right Side (approx. 75-80%):** Forward tap to next media.
    *   **Left Side (approx. 20-25%):** Back tap to previous media.
    *   **Logic:** If at the last slide of User A, a forward tap transitions to the first slide of User B.
*   **Horizontal Swipe (Inter-user):** Transitions between different users.
    *   **Swipe Left:** Move to the next user's story deck.
    *   **Swipe Right:** Move to the previous user's story deck.
    *   **Visual:** Often implemented as a 3D "cube" transition effect.

## 2. Progress Bar Behavior
*   **Segmented Layout:** The bar is divided into N segments where N is the number of stories the user has posted.
*   **Active Indicator:** Only the segment for the currently viewed media fills up.
*   **Persistent Context:** The segmented bar provides "wayfinding," showing how much content remains in the current deck.
*   **Finished vs. Future:** Completed segments remain full; future segments remain empty.

## 3. Gesture Conflict Resolution
*   **Swipe vs. Tap:** Taps are filtered for simple clicks. Swipes require a minimum movement threshold (distance/velocity).
*   **Horizontal vs. Vertical:**
    *   **Vertical Swipe Up:** Triggers "Swipe Up" links or opens the reply/reactions drawer.
    *   **Vertical Swipe Down:** Dismisses the story viewer and returns to the feed.
    *   **Priority:** Horizontal movement takes precedence for inter-user navigation to prevent accidental dismissal during side-to-side browsing.

## 4. Auto-Advance & Pause
*   **Timing:**
    *   **Photos:** Static 5 seconds (standard) to 15 seconds (max).
    *   **Videos:** Plays for the full duration of the clip (typically 15s or 60s segments).
*   **Pause Logic:**
    *   **Long Press:** Pauses the timer and hides UI elements (UI-less mode for better viewing).
    *   **Interaction:** Any open overlay (keyboard, menu) pauses the auto-advance.
*   **Auto-Resume:** Resumes timing immediately upon finger lift.

## 5. Preloading & Smooth Transitions
*   **Buffer Strategy:**
    *   **Immediate:** Preload current media + next 1 slide in the current user's deck.
    *   **Parallel:** Preload the first slide of the "next user" in the queue.
*   **Video Handling:** Uses HLS or DASH for adaptive bitrate. Pre-buffers the first few seconds of the next video to ensure instant start on tap/swipe.
*   **Image Optimization:** Fetches progressive JPEGs or WebP. Low-res placeholders (or blurhashes) are shown if the high-res version isn't ready.

## Sources
1. [Instagram Stories Strategy: Visual Engagement](https://feedbird.com/blog/instagram-stories-strategy-engage-with-visual-stories)
2. [What Navigation Means on Instagram](https://madgicx.com/blog/what-navigation-mean-on-instagram)
3. [GoodUX: Instagram's Story Swipe and Tap Protocol](https://goodux.appcues.com/blog/instagrams-story-swipe-and-tap-protocol)
4. [Engineering at Instagram: Fast Loading Reels/Stories](https://instagram-engineering.com/)

## Unresolved Questions
1. What is the exact pixel threshold for distinguishing a "tap" from a "micro-swipe" on different screen densities?
2. Does the auto-advance timing vary based on the amount of text/stickers detected on the image?
3. How does the system handle preloading in low-bandwidth (2G/3G) environments—does it prioritize the current user or still attempt next-user preloading?
