import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const allowedOrigins = ['*'];  
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const origin = req.headers.get('origin') ?? '';
  const isPreflight = req.method === 'OPTIONS';
  const isAllowedOrigin = allowedOrigins.includes(origin) || allowedOrigins.includes('*');

  // CORS Preflight Request Handling
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // CORS Headers for Simple Requests
  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Authentication Middleware
  const token = req.cookies.get('token')?.value;

  // Paths that require authentication
  const authPaths = ['/home'];
  const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isAuthPath) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/protected-route/:path*'], // CORS for all API routes, authentication for protected routes
};
