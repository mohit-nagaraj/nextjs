import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'

//having  [kindeAuth] in the path makes it a dynamic route
//the route will be /api/auth/:kindeAuth
export async function GET(
  request: NextRequest,
  { params }: any
) {
  const endpoint = params.kindeAuth
  return handleAuth(request, endpoint)
}