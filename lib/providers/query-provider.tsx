'use client'

/**
 * TanStack Query Provider
 * Provides client-side caching and state management for data fetching
 * - staleTime: 60s - data considered fresh for 1 minute
 * - gcTime: 5 minutes - cached data kept for 5 minutes after last use
 * - refetchOnWindowFocus: false - prevent unnecessary refetches
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Cache kept for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1000,
        // Don't refetch on window focus (saves bandwidth)
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Don't refetch on reconnect by default
        refetchOnReconnect: false,
      },
    },
  })
}

// Browser: create singleton query client
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create new client
    return makeQueryClient()
  } else {
    // Browser: reuse existing client or create new one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use useState to ensure client is created only once per component lifecycle
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
