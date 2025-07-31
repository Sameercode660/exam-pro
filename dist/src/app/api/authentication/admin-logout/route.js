"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
async function POST() {
    const response = server_1.NextResponse.json({
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
