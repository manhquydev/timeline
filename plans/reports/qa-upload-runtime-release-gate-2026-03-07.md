# QA Release Gate - Upload Runtime Sync (2026-03-07)

## Scope
- Phase 2 sync: `admin settings -> upload engine`
- Client-side runtime pre-validation sync: toast/label/accept/max-size/compression hints

## Execution Evidence
- Ran test suite subset:
  - `tests/admin/admin-settings-route.test.ts`
  - `tests/e2e/event-lifecycle-flow.test.ts`
  - `tests/e2e/admin-event-crud-extended-flow.test.ts`
  - `tests/e2e/admin-flow.test.ts`
  - `tests/e2e/user-presigned-upload-flow.test.ts`
  - `tests/e2e/user-flow.test.ts`
  - `tests/user/upload-api.test.ts`
  - `tests/user/upload-settings-api.test.ts`
- Result: `45 passed / 45`

## Checklist (8 scenarios)
1. Runtime max-size shown in UI label and enforced in pre-validation
- Result: PASS
- Evidence:
  - `components/upload/upload-media-picker.tsx` uses `runtimeSettings.maxFileSizeMB` for label and dropzone maxSize.
  - `components/upload/hooks/upload-file-validation.ts` validates per-file with runtime `maxFileSizeMB`.

2. MIME toggle (video enabled) reflected by runtime allowed types
- Result: PASS
- Evidence:
  - `components/upload/upload-media-picker.tsx` builds `accept` from `runtimeSettings.allowedTypes` and conditionally shows `Video enabled`.

3. MIME toggle (video disabled) removes video capability from picker path
- Result: PASS
- Evidence:
  - `buildDropzoneAccept(runtimeSettings.allowedTypes)` and `inputAccept` are runtime-derived; no hardcoded `image/*,video/*` left in picker path.

4. Fallback settings when `/api/upload/settings` fails/unavailable
- Result: PASS
- Evidence:
  - `components/upload/hooks/use-upload-runtime-settings.ts` falls back to `DEFAULT_UPLOAD_RUNTIME_SETTINGS` in non-OK or catch paths.

5. Network fail handling in upload flow
- Result: PASS
- Evidence:
  - `components/upload/hooks/use-upload-flow.ts` catch path maps network failures to `ERROR_MESSAGES.NETWORK_ERROR` and destructive toast.
  - Server-side signed URL failure path validated by `tests/e2e/user-presigned-upload-flow.test.ts`.

6. Partial success handling (some files fail)
- Result: PASS
- Evidence:
  - `components/upload/hooks/use-upload-flow.ts` and `components/upload/upload-zone.tsx` handle `successCount > 0 && < total` with `ERROR_MESSAGES.PARTIAL_SUCCESS` + destructive toast.

7. Runtime compression hint text reflects current settings
- Result: PASS
- Evidence:
  - `components/upload/upload-media-picker.tsx` shows `~compressionTargetMB @ compressionQuality%` from runtime.
  - `components/upload/upload-zone.tsx` uses runtime compression text.

8. Deprecated UploadZone parity with runtime pre-validation
- Result: PASS
- Evidence:
  - `components/upload/upload-zone.tsx` now uses `useUploadRuntimeSettings` for tips/labels/accept/max-size/errors.
  - Count validation tightened to run after filtering valid files; preview URLs revoked on count-fail.

## Gate Decision
- RELEASE GATE: PASS

## Residual Risk (non-blocking)
- `npm run lint` script/environment issue (`next lint` resolves wrong project dir).
- Global `npx tsc --noEmit` still has unrelated pre-existing admin test typing errors.
