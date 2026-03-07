const DEFAULT_TIMEOUT_MS = 15000

function readNumberEnv(name, fallback) {
  const raw = process.env[name]
  if (!raw) return fallback

  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseProjectRefFromUrl(url) {
  if (!url) return null

  try {
    const hostname = new URL(url).hostname
    const [projectRef] = hostname.split(".")
    return projectRef || null
  } catch {
    return null
  }
}

function getConfig() {
  const projectRef =
    process.env.SUPABASE_PROJECT_REF || parseProjectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ""
  const timeoutMs = readNumberEnv("SUPABASE_KEEPALIVE_TIMEOUT_MS", DEFAULT_TIMEOUT_MS)
  const keepaliveUrl =
    process.env.SUPABASE_KEEPALIVE_URL ||
    (projectRef ? `https://${projectRef}.supabase.co/rest/v1/` : null)

  if (!projectRef) {
    throw new Error(
      "Missing Supabase project ref. Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL.",
    )
  }

  if (!anonKey) {
    throw new Error(
      "Missing Supabase anon key. Set SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  if (!keepaliveUrl) {
    throw new Error("Cannot determine keepalive URL.")
  }

  return {
    projectRef,
    anonKey,
    accessToken,
    timeoutMs,
    keepaliveUrl,
  }
}

function previewBody(bodyText) {
  if (!bodyText) return ""
  const squashed = bodyText.replace(/\s+/g, " ").trim()
  return squashed.slice(0, 240)
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    const bodyText = await response.text()
    return { response, bodyText }
  } finally {
    clearTimeout(timeout)
  }
}

function isPausedStatus(statusCode, bodyText) {
  return statusCode === 540 || /project paused/i.test(bodyText)
}

async function pingProject(config) {
  const { response, bodyText } = await fetchWithTimeout(
    config.keepaliveUrl,
    {
      method: "GET",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Accept: "application/json",
        "User-Agent": "timeline-supabase-keepalive/1.0",
      },
    },
    config.timeoutMs,
  )

  const statusCode = response.status
  const body = previewBody(bodyText)

  console.log(`[keepalive] Probe ${config.keepaliveUrl} -> HTTP ${statusCode}`)
  if (body) {
    console.log(`[keepalive] Response preview: ${body}`)
  }

  if (statusCode >= 200 && statusCode < 400) {
    console.log("[keepalive] Supabase project is active.")
    return
  }

  if (isPausedStatus(statusCode, bodyText)) {
    if (!config.accessToken) {
      throw new Error(
        "Project appears paused but SUPABASE_ACCESS_TOKEN is not configured for auto-restore.",
      )
    }

    await restoreProject(config)
    return
  }

  throw new Error(`[keepalive] Unexpected response status: ${statusCode}`)
}

async function restoreProject(config) {
  const restoreUrl = `https://api.supabase.com/v1/projects/${config.projectRef}/restore`

  console.log("[keepalive] Project appears paused. Attempting restore via Management API...")

  const { response, bodyText } = await fetchWithTimeout(
    restoreUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "timeline-supabase-keepalive/1.0",
      },
    },
    config.timeoutMs,
  )

  const statusCode = response.status
  const body = previewBody(bodyText)
  console.log(`[keepalive] Restore request -> HTTP ${statusCode}`)
  if (body) {
    console.log(`[keepalive] Restore response preview: ${body}`)
  }

  if (statusCode >= 200 && statusCode < 300) {
    console.log("[keepalive] Restore accepted. Project should become active shortly.")
    return
  }

  throw new Error(`[keepalive] Restore failed with status ${statusCode}.`)
}

async function main() {
  const config = getConfig()
  await pingProject(config)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`[keepalive] ${message}`)
  process.exit(1)
})
