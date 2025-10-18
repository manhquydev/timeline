import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    // Try to exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // CASE 1: Exchange successful - redirect immediately
    // This is the normal happy path
    if (data?.session) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // CASE 2: Exchange failed, but check if user already has a session
    // This handles email scanner prefetch cases where code was already used
    // but user is actually verified and logged in
    if (error) {
      console.error('Auth callback error:', error.message, error.code)

      // Check if user has existing session despite error
      const { data: { session: existingSession } } = await supabase.auth.getSession()

      if (existingSession) {
        console.log('Session exists despite exchange error - redirecting to success')
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }
  }

  // CASE 3: No code, or exchange truly failed with no session
  // Instead of showing error page, redirect to login with message
  // Many users reach here because email scanners consumed the link,
  // but their account is already verified - they just need to login
  const redirectUrl = new URL(`${origin}/login`)
  redirectUrl.searchParams.set('message', 'verified')
  return NextResponse.redirect(redirectUrl)
}
