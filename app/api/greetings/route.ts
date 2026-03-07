import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { greetingRepository } from '@/lib/mongodb/repositories'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { message, authorName, eventTag = '8-3' } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung lời chúc không được trống' }, { status: 400 })
    }
    if (message.trim().length > 280) {
      return NextResponse.json({ error: 'Lời chúc tối đa 280 ký tự' }, { status: 400 })
    }
    // Basic XSS prevention — strip HTML tags
    const sanitizedMessage = message.trim().replace(/<[^>]*>/g, '')

    const displayName = user
      ? (user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ẩn danh')
      : (typeof authorName === 'string' && authorName.trim() ? authorName.trim().slice(0, 50) : 'Ẩn danh')

    const greeting = await greetingRepository.create({
      authorId: user?.id ?? null,
      authorName: displayName,
      message: sanitizedMessage,
      eventTag,
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
