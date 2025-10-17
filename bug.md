:3000/:1  GET http://localhost:3000/ 500 (Internal Server Error)
main.js:1431 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
index.js:640 Uncaught Error: Module not found: Can't resolve '@/hooks/use-toast'
  10 | import { Card, CardContent } from '@/components/ui/card'
  11 | import { validateImageFile } from '@/lib/image-utils'
> 12 | import { useToast } from '@/hooks/use-toast'
     | ^
  13 |
  14 | interface UploadZoneProps {
  15 |   eventId: string

https://nextjs.org/docs/messages/module-not-found

    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at getNotFoundError (file://C:\Users\manhq\Downloads\clone 2\timeline\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\parseNotFoundError.js:140:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async getModuleBuildError (file://C:\Users\manhq\Downloads\clone 2\timeline\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\webpackModuleError.js:103:27)
    at async (file://C:\Users\manhq\Downloads\clone 2\timeline\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:29:49)
    at async (file://C:\Users\manhq\Downloads\clone 2\timeline\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:27:21)
getServerError @ node-stack-frames.js:41
eval @ index.js:640
setTimeout
hydrate @ index.js:618
await in hydrate
pageBootstrap @ page-bootstrap.js:28
eval @ next-dev.js:24
Promise.then
eval @ next-dev.js:22
(pages-dir-browser)/./node_modules/next/dist/client/next-dev.js @ main.js:314
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main.js:1546
(anonymous) @ main.js:1547
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main.js:9
websocket.js:46 [HMR] connected
pages-dev-overlay-setup.js:77 ./components/upload/upload-zone.tsx:12:1
Module not found: Can't resolve '@/hooks/use-toast'
  10 | import { Card, CardContent } from '@/components/ui/card'
  11 | import { validateImageFile } from '@/lib/image-utils'
> 12 | import { useToast } from '@/hooks/use-toast'
     | ^
  13 |
  14 | interface UploadZoneProps {
  15 |   eventId: string

https://nextjs.org/docs/messages/module-not-found
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:77
handleErrors @ hot-reloader-pages.js:164
processMessage @ hot-reloader-pages.js:228
eval @ hot-reloader-pages.js:72
handleMessage @ websocket.js:69
favicon.ico:1  GET http://localhost:3000/favicon.ico 404 (Not Found)
index.js:1631 {file: {…}}
