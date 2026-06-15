import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    await req.json().catch(() => null)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
