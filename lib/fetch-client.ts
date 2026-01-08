/**
 * CSRF-protected fetch client for frontend API calls
 * Automatically fetches and includes CSRF token for mutation requests
 */

const CSRF_HEADER = 'x-csrf-token'
let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

/**
 * Fetch CSRF token from server
 */
async function fetchCsrfToken(): Promise<string> {
    const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
    }

    const data = await response.json()
    return data.token
}

/**
 * Get CSRF token, fetching if needed
 */
async function getCsrfToken(): Promise<string> {
    if (csrfToken) {
        return csrfToken
    }

    // Prevent duplicate fetches
    if (!tokenPromise) {
        tokenPromise = fetchCsrfToken().then(token => {
            csrfToken = token
            tokenPromise = null
            return token
        }).catch(err => {
            tokenPromise = null
            throw err
        })
    }

    return tokenPromise
}

/**
 * Refresh CSRF token (call after auth state changes)
 */
export async function refreshCsrfToken(): Promise<void> {
    csrfToken = null
    tokenPromise = null
    await getCsrfToken()
}

/**
 * CSRF-protected fetch wrapper
 * Automatically includes CSRF token for POST, PUT, PATCH, DELETE requests
 */
export async function apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
    const method = (options.method || 'GET').toUpperCase()
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

    const headers = new Headers(options.headers)

    // Add CSRF token for mutation requests
    if (needsCsrf) {
        try {
            const token = await getCsrfToken()
            headers.set(CSRF_HEADER, token)
        } catch (err) {
            console.error('Failed to get CSRF token:', err)
        }
    }

    // Ensure credentials are included
    const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
    }

    try {
        const response = await fetch(url, fetchOptions)
        const status = response.status

        // Handle CSRF token expiry - refresh and retry once
        if (status === 403 && needsCsrf) {
            const errorData = await response.json().catch(() => ({}))
            if (errorData.code === 'CSRF_INVALID') {
                csrfToken = null
                const newToken = await getCsrfToken()
                headers.set(CSRF_HEADER, newToken)

                const retryResponse = await fetch(url, { ...fetchOptions, headers })
                const retryData = await retryResponse.json().catch(() => null)

                if (!retryResponse.ok) {
                    return {
                        data: null,
                        error: retryData?.error || retryData?.message || 'Request failed',
                        status: retryResponse.status,
                    }
                }

                return { data: retryData as T, error: null, status: retryResponse.status }
            }
        }

        const data = await response.json().catch(() => null)

        if (!response.ok) {
            return {
                data: null,
                error: data?.error || data?.message || 'Request failed',
                status,
            }
        }

        return { data: data as T, error: null, status }
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Network error',
            status: 0,
        }
    }
}

/**
 * Convenience methods
 */
export const api = {
    get: <T = unknown>(url: string, options?: RequestInit) =>
        apiFetch<T>(url, { ...options, method: 'GET' }),

    post: <T = unknown>(url: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        }),

    put: <T = unknown>(url: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        }),

    patch: <T = unknown>(url: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(url, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        }),

    delete: <T = unknown>(url: string, options?: RequestInit) =>
        apiFetch<T>(url, { ...options, method: 'DELETE' }),
}
