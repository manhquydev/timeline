react-dom-client.development.js:25631 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
connection.ts:46  Server  ✅ MongoDB connected successfully
:3000/favicon.ico:1  Failed to load resource: the server responded with a status of 404 (Not Found)
intercept-console-error.js:57 A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<SegmentViewNode>} forbidden={undefined} ...>
      <RedirectBoundary>
        <RedirectErrorBoundary router={{...}}>
          <InnerLayoutRouter url="/" tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
            <SegmentViewNode type="page" pagePath="page.tsx">
              <SegmentTrieNode>
              <Home>
                <main className="min-h-scre...">
                  <div>
                  <div>
                  <div id="events" className="container ...">
                    <div>
                    <TimelineSwitcher events={[...]}>
                      <div>
                        <div>
                        <div className="transition...">
                          <MemoryRiverTimeline events={[...]}>
                            <div ref={{current:null}} className="jsx-d35205...">
                              <div className="jsx-d35205...">
                                <div
                                  style={{
+                                   left: "12.744267714789148%"
-                                   left: "11.2431%"
+                                   top: "38.84953726015703%"
-                                   top: "41.2557%"
+                                   animationDelay: "3.769265122617518s"
+                                   animationDuration: "11.631462621940623s"
-                                   animation-delay: "2.0029s"
-                                   animation-duration: "9.11359s"
                                  }}
                                  className="jsx-d352053ea27268f7 absolute w-1 h-1 bg-primary/20 rounded-full animate-..."
                                >
                                <div
                                  style={{
+                                   left: "72.27290646324464%"
-                                   left: "82.7626%"
+                                   top: "51.09186852581108%"
-                                   top: "28.0089%"
+                                   animationDelay: "2.6968209116289232s"
+                                   animationDuration: "5.195320909121937s"
-                                   animation-delay: "2.68582s"
-                                   animation-duration: "14.7228s"
                                  }}
                                  className="jsx-d352053ea27268f7 absolute w-1 h-1 bg-primary/20 rounded-full animate-..."
                                >
                                <div
                                  style={{
+                                   left: "11.783046332436564%"
-                                   left: "9.7401%"
+                                   top: "96.73805146232968%"
-                                   top: "16.7738%"
+                                   animationDelay: "1.616639930961961s"
+                                   animationDuration: "5.515048095487128s"
-                                   animation-delay: "2.06541s"
-                                   animation-duration: "5.04385s"
                                  }}
                                  className="jsx-d352053ea27268f7 absolute w-1 h-1 bg-primary/20 rounded-full animate-..."
                                >
                                <div
                                  style={{
+                                   left: "6.773642391993418%"
-                                   left: "59.7576%"
+                                   top: "58.83407047462504%"
-                                   top: "17.2617%"
+                                   animationDelay: "2.6514947415465526s"
+                                   animationDuration: "5.010300954442764s"
-                                   animation-delay: "3.64853s"
-                                   animation-duration: "6.50502s"
                                  }}
                                  className="jsx-d352053ea27268f7 absolute w-1 h-1 bg-primary/20 rounded-full animate-..."
                                >
                                <div
                                  style={{
+                                   left: "80.43022502182386%"
-                                   left: "97.0878%"
+                               
error @ intercept-console-error.js:57
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 1663ms
VM587 <anonymous>:1 Skipping auto-scroll behavior due to `position: sticky` or `position: fixed` on element: <nav class=​"border-b border-border/​50 bg-background/​80 sticky top-0 z-40 backdrop-blur-2xl shadow-sm">​…​</nav>​
shouldSkipElement @ layout-router.js:100
InnerScrollAndFocusHandler.handlePotentialScroll @ layout-router.js:169
componentDidMount @ layout-router.js:131
react_stack_bottom_frame @ react-dom-client.development.js:23607
runWithFiberInDEV @ react-dom-client.development.js:872
commitLayoutEffectOnFiber @ react-dom-client.development.js:13071
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13164
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13164
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13053
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13048
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13255
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:14121
commitLayoutEffectOnFiber @ react-dom-client.development.js:13130
flushLayoutEffects @ react-dom-client.development.js:16156
commitRoot @ react-dom-client.development.js:15997
onUnsuspend @ react-dom-client.development.js:21077
<InnerScrollAndFocusHandler>
exports.jsx @ react-jsx-runtime.development.js:323
ScrollAndFocusHandler @ layout-router.js:237
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ScrollAndFocusHandler>
exports.jsxs @ react-jsx-runtime.development.js:337
OuterLayoutRouter @ layout-router.js:471
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1343
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1101
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2899
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/bSSGFJJTMyTTQ1FEyM51J_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/bMugTCcyVsBp08E2ZTEF2_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/U65ILkKFHNttsAlmXzZjF_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/rr8TVmKK2dC1CznHC_gMv_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/UluhCXrDTgqKcLVNCkCCs_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/pC20fLFRFRejuo9LsdFkW_thumb.png" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85 Image with src "https://lcoppqufztwjkjmlxzun.supabase.co/storage/v1/object/public/event-media/e7WUQC0C9rTqblrd7xET7/2cb2b51a-085d-4c7f-b8ff-522323c17b67/xIum1e_5hYo3Ai-PKWPRS_thumb.jpg" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
warnOnce @ warn-once.js:16
eval @ image-component.js:89
Promise.then
handleLoading @ image-component.js:36
onLoad @ image-component.js:191
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
<img>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:166
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsx @ react-jsx-runtime.development.js:323
eval @ image-component.js:280
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateForwardRef @ react-dom-client.development.js:8807
beginWork @ react-dom-client.development.js:11197
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<ForwardRef>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
eval @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:85
PinboardGrid @ C:\Users\manhq\Downloads\clone 2\timeline\components\photos\pinboard-grid.tsx:54
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<PinboardGrid>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
EventPhotos @ C:\Users\manhq\Downloads\clone 2\timeline\components\events\event-photos-enhanced.tsx:58
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
EventPage @ page.tsx:245
initializeElement @ react-server-dom-webpack-client.browser.development.js:1344
eval @ react-server-dom-webpack-client.browser.development.js:3066
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1246
readChunk @ react-server-dom-webpack-client.browser.development.js:935
react_stack_bottom_frame @ react-dom-client.development.js:23691
resolveLazy @ react-dom-client.development.js:5177
createChild @ react-dom-client.development.js:5494
reconcileChildrenArray @ react-dom-client.development.js:5801
reconcileChildFibersImpl @ react-dom-client.development.js:6124
eval @ react-dom-client.development.js:6229
reconcileChildren @ react-dom-client.development.js:8783
updateFunctionComponent @ react-dom-client.development.js:9264
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<EventPage>
Function.all @ VM587 <anonymous>:1
Function.all @ VM587 <anonymous>:1
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2529
initializeDebugInfo @ react-server-dom-webpack-client.browser.development.js:2554
initializeDebugChunk @ react-server-dom-webpack-client.browser.development.js:1193
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2850
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2766
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2969
progress @ react-server-dom-webpack-client.browser.development.js:3233
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2041
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3094
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3478
createFromNextReadableStream @ fetch-server-response.js:209
fetchServerResponse @ fetch-server-response.js:116
