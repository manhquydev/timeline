import { NextResponse } from 'next/server'
import { connectToDatabase, getConnectionStatus } from '@/lib/mongodb/connection'
import { createClient } from '@/lib/supabase/server'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  message?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    mongodb: HealthCheck
    supabase: HealthCheck
  }
}

const startTime = Date.now()

async function checkMongoDB(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    await connectToDatabase()
    const status = getConnectionStatus()
    const latency = Date.now() - start

    if (status === 'connected') {
      return { status: 'healthy', latency }
    }
    return { status: 'degraded', latency, message: `Connection status: ${status}` }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const supabase = await createClient()
    // Simple auth check to verify connection
    await supabase.auth.getSession()
    const latency = Date.now() - start

    return { status: 'healthy', latency }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function determineOverallStatus(checks: HealthResponse['checks']): HealthResponse['status'] {
  const statuses = Object.values(checks).map((c) => c.status)

  if (statuses.every((s) => s === 'healthy')) return 'healthy'
  if (statuses.some((s) => s === 'unhealthy')) return 'unhealthy'
  return 'degraded'
}

export async function GET() {
  const [mongodb, supabase] = await Promise.all([checkMongoDB(), checkSupabase()])

  const checks = { mongodb, supabase }
  const status = determineOverallStatus(checks)

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  }

  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

  return NextResponse.json(response, { status: httpStatus })
}
