import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

//having  [kindeAuth] in the path makes it a dynamic route
//the route will be /api/auth/:kindeAuth
export async function GET(
  request: NextRequest,
  { params }: any
) {
  const endpoint = params.kindeAuth;
  
  try {
    const response = await handleAuth(request, endpoint);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.error();
  }
}
