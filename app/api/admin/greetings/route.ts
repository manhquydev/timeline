import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { greetingRepository } from '@/lib/mongodb/repositories'

type AdminGreetingStatus = 'pending' | 'approved' | 'rejected' | 'all'
type GreetingAction = 'approve' | 'unapprove' | 'reject' | 'restore' | 'update'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isCurrentUserAdmin())) return null
  return user
}

function normalizeStatus(status: string | null): AdminGreetingStatus {
  if (status === 'pending' || status === 'approved' || status === 'rejected' || status === 'all') {
    return status
  }
  return 'pending'
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10)))
  const status = normalizeStatus(searchParams.get('status'))
  const eventTag = searchParams.get('eventTag') ?? undefined
  const eventId = searchParams.get('eventId') ?? undefined
  const q = searchParams.get('q') ?? undefined

  const result = await greetingRepository.findAll({ page, limit, eventTag, eventId, status, q })

  return NextResponse.json({
    greetings: result.items,
    pagination: {
      page,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    },
  })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json()
  const id = normalizeOptionalText(body?.id)
  const action = body?.action as GreetingAction | undefined

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action required' }, { status: 400 })
  }

  if (action === 'approve') {
    await greetingRepository.approve(id)
    return NextResponse.json({ success: true, message: 'Đã duyệt thiệp' })
  }

  if (action === 'unapprove') {
    await greetingRepository.unapprove(id)
    return NextResponse.json({ success: true, message: 'Đã chuyển về chờ duyệt' })
  }

  if (action === 'reject') {
    await greetingRepository.reject(id)
    return NextResponse.json({ success: true, message: 'Đã ẩn thiệp khỏi hệ thống hiển thị' })
  }

  if (action === 'restore') {
    await greetingRepository.restore(id)
    return NextResponse.json({ success: true, message: 'Đã khôi phục thiệp' })
  }

  if (action === 'update') {
    const rawMessage = normalizeOptionalText(body?.message)
    if (!rawMessage || rawMessage.length > 280) {
      return NextResponse.json({ error: 'message is required and must be <= 280 chars' }, { status: 400 })
    }

    const rawAuthorName = normalizeOptionalText(body?.authorName)
    const rawEventTag = normalizeOptionalText(body?.eventTag)
    const rawEventId = normalizeOptionalText(body?.eventId)
    const rawEventSlug = normalizeOptionalText(body?.eventSlug)

    const templateId =
      typeof body?.templateId === 'number' && Number.isFinite(body.templateId)
        ? body.templateId
        : null

    await greetingRepository.updateById(id, {
      message: rawMessage,
      authorName: rawAuthorName ? rawAuthorName.slice(0, 50) : 'Ẩn danh',
      eventTag: rawEventTag ? rawEventTag.toLowerCase() : 'general',
      eventId: rawEventId,
      eventSlug: rawEventSlug,
      templateId,
    })

    return NextResponse.json({ success: true, message: 'Đã cập nhật thiệp' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = normalizeOptionalText(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await greetingRepository.deleteById(id)
  return NextResponse.json({ success: true, message: 'Đã xóa vĩnh viễn thiệp' })
}
