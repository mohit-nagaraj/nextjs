import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: any
) {
  const endpoint = params.kindeAuth
  const handler = await handleAuth(request, endpoint)
  const response = await handler(request, {} as any) // Assuming the second argument is an empty object
  return NextResponse.json(response)
}