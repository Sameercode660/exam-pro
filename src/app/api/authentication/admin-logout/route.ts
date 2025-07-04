
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    status: true,
    message: 'Logged out successfully',
  });

  // Clear the token cookie by setting it to expire immediately
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Expire immediately
  });

  return response;
}
