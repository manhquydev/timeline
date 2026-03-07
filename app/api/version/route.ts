import { NextResponse } from 'next/server'

const BUILD_ID =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_URL ||
  'local-development'

export async function GET() {
  return NextResponse.json(
    {
      buildId: BUILD_ID,
      appVersion: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}
