"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const allowedOrigins = ['*'];
const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
function middleware(req) {
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
        return server_1.NextResponse.json({}, { headers: preflightHeaders });
    }
    // CORS Headers for Simple Requests
    const response = server_1.NextResponse.next();
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
            return server_1.NextResponse.redirect(url);
        }
        try {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch {
            url.pathname = '/login';
            return server_1.NextResponse.redirect(url);
        }
    }
    return response;
}
exports.config = {
    matcher: ['/api/:path*', '/protected-route/:path*'], // CORS for all API routes, authentication for protected routes
};
