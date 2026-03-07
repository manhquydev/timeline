import { NextResponse } from 'next/server'
import { greetingRepository } from '@/lib/mongodb/repositories'

const FALLBACK_GREETINGS = [
  { message: 'Chúc mừng ngày Quốc tế Phụ nữ 8/3! Chúc bạn luôn tươi trẻ, xinh đẹp và hạnh phúc! 🌹', authorName: 'Team Timeline' },
  { message: 'Gửi đến những người phụ nữ tuyệt vời nhất — cảm ơn bạn đã làm cho thế giới này tươi đẹp hơn! 💕', authorName: 'Mọi người' },
  { message: 'Phụ nữ mạnh mẽ, tự tin và luôn tỏa sáng rực rỡ! 🌸', authorName: 'Timeline App' },
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventTag = searchParams.get('tag') ?? '8-3'

    const greeting = await greetingRepository.findRandom(eventTag)

    if (!greeting) {
      const fallback = FALLBACK_GREETINGS[Math.floor(Math.random() * FALLBACK_GREETINGS.length)]
      return NextResponse.json({ greeting: fallback, isFallback: true })
    }

    return NextResponse.json({
      greeting: {
        message: greeting.message,
        authorName: greeting.authorName,
      },
      isFallback: false,
    })
  } catch (error) {
    console.error('GET /api/greetings/random error:', error)
    const fallback = FALLBACK_GREETINGS[0]
    return NextResponse.json({ greeting: fallback, isFallback: true })
  }
}
