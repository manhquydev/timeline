import { NextResponse } from 'next/server'

import { greetingRepository, postRepository } from '@/lib/mongodb/repositories'

type GreetingSource = 'post_wish' | 'greeting' | 'empty_event'

function normalizeTag(tag: string | null): string | null {
  const normalized = tag?.trim().toLowerCase()
  return normalized && normalized.length > 0 ? normalized : null
}

function normalizeNullable(value: string | null): string | null {
  if (!value) return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function buildEventPostLink(eventSlug: string | null, postId: string): string | null {
  if (!eventSlug) return null
  return `/events/${encodeURIComponent(eventSlug)}?postId=${encodeURIComponent(postId)}`
}

function buildGreetingLink(eventSlug: string | null, greetingId: string): string | null {
  if (!eventSlug) return null
  return `/events/${encodeURIComponent(eventSlug)}?greetingId=${encodeURIComponent(greetingId)}#event-greeting-focus`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventTag = normalizeTag(searchParams.get('tag'))
    const eventId = normalizeNullable(searchParams.get('eventId'))
    const eventSlugFromQuery = normalizeNullable(searchParams.get('eventSlug'))

    const [randomGreeting, randomPostWish] = await Promise.all([
      greetingRepository.findRandomByEventContext(eventId, eventTag),
      eventId ? postRepository.findRandomApprovedWishByEvent(eventId) : Promise.resolve(null),
    ])

    const greetingMessage =
      typeof randomGreeting?.message === 'string' ? randomGreeting.message.trim() : ''

    // Prefer dedicated greeting-card data over generic post wishes.
    if (randomGreeting && greetingMessage.length > 0) {
      const eventSlug = eventSlugFromQuery || randomGreeting.eventSlug || null
      return NextResponse.json({
        greeting: {
          id: randomGreeting.id,
          message: greetingMessage,
          authorName: randomGreeting.authorName,
          templateId: randomGreeting.templateId ?? null,
          source: 'greeting' as GreetingSource,
          deepLink: buildGreetingLink(eventSlug, randomGreeting.id),
          eventId: randomGreeting.eventId || eventId,
          eventTag: randomGreeting.eventTag || eventTag,
        },
        isFallback: false,
      })
    }

    const postWishMessage =
      typeof randomPostWish?.wish_text === 'string' ? randomPostWish.wish_text.trim() : ''

    if (randomPostWish && postWishMessage.length > 0) {
      const eventSlug = eventSlugFromQuery
      return NextResponse.json({
        greeting: {
          id: randomPostWish.id,
          message: postWishMessage,
          authorName: randomPostWish.user_name || 'Thành viên sự kiện',
          source: 'post_wish' as GreetingSource,
          deepLink: buildEventPostLink(eventSlug, randomPostWish.id),
          mediaPreviewUrl:
            randomPostWish.thumbnail_url ||
            (randomPostWish.media_type === 'image' ? randomPostWish.media_url : null),
          eventId,
          eventTag,
        },
        isFallback: false,
      })
    }

    return NextResponse.json({
      greeting: {
        id: null,
        message: 'Sự kiện này chưa có lời chúc được duyệt. Hãy gửi thiệp để bắt đầu nhé!',
        authorName: 'Timeline',
        source: 'empty_event' as GreetingSource,
        deepLink: eventSlugFromQuery ? `/events/${encodeURIComponent(eventSlugFromQuery)}` : null,
        eventId,
        eventTag,
      },
      isFallback: true,
    })
  } catch (error) {
    console.error('GET /api/greetings/random error:', error)
    return NextResponse.json({
      greeting: {
        id: null,
        message: 'Không thể tải lời chúc lúc này. Vui lòng thử lại sau.',
        authorName: 'Timeline',
        source: 'empty_event' as GreetingSource,
        deepLink: null,
      },
      isFallback: true,
    })
  }
}
