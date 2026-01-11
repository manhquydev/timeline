'use client'

import { useRouter } from 'next/navigation'
import { UploadBottomSheet } from '@/components/upload/upload-bottom-sheet'
import type { UploadEvent } from '@/components/upload/types'

interface UploadPageClientProps {
  events: UploadEvent[]
}

/**
 * Client component for upload page with auto-open bottom sheet
 * This provides a full-screen upload experience on /upload page
 */
export function UploadPageClient({ events }: UploadPageClientProps) {
  const router = useRouter()

  const handleComplete = () => {
    // Navigate to home after successful upload
    router.push('/')
  }

  const handleClose = () => {
    // Navigate back when user closes the sheet
    router.back()
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <UploadBottomSheet
        events={events}
        defaultOpen={true}
        onComplete={handleComplete}
        onClose={handleClose}
      />
    </main>
  )
}
