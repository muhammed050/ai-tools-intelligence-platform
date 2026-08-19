import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { checkToolHealth } from '@/lib/services/monitoring/health'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    return NextResponse.json(await checkToolHealth((await params).id))
  } catch (error) {
    console.error('Tool health check failed', error)
    return NextResponse.json({ error: 'Unable to complete the health check.' }, { status: 400 })
  }
}
