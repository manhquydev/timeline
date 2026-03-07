import { NextResponse } from 'next/server'

import { greetingRepository } from '@/lib/mongodb/repositories'
import { createClient } from '@/lib/supabase/server'

function normalizeEventTag(tag: unknown): string {
  if (typeof tag !== 'string') return 'general'
  const normalized = tag.trim().toLowerCase()
  return normalized.length > 0 ? normalized : 'general'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await req.json()
    const { message, authorName, eventTag, eventId, eventSlug, templateId } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung lời chúc không được trống' }, { status: 400 })
    }

    if (message.trim().length > 280) {
      return NextResponse.json({ error: 'Lời chúc tối đa 280 ký tự' }, { status: 400 })
    }

    const sanitizedMessage = message.trim().replace(/<[^>]*>/g, '')
    const normalizedEventTag = normalizeEventTag(eventTag)

    const displayName = user
      ? (user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ẩn danh')
      : (typeof authorName === 'string' && authorName.trim() ? authorName.trim().slice(0, 50) : 'Ẩn danh')

    const greeting = await greetingRepository.create({
      authorId: user?.id ?? null,
      authorName: displayName,
      message: sanitizedMessage,
      eventTag: normalizedEventTag,
      eventId: typeof eventId === 'string' && eventId.trim().length > 0 ? eventId.trim() : null,
      eventSlug: typeof eventSlug === 'string' && eventSlug.trim().length > 0 ? eventSlug.trim() : null,
      templateId: typeof templateId === 'number' ? templateId : null,
    })

    return NextResponse.json(
      { greeting, message: 'Lời chúc đã được gửi thành công và đang chờ duyệt!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/greetings error:', error)
    return NextResponse.json({ error: 'Không thể gửi lời chúc' }, { status: 500 })
  }
}
