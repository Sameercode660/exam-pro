"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const cookie_1 = require("cookie");
async function POST() {
    const serializedCookie = (0, cookie_1.serialize)("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire immediately
        path: "/",
    });
    const response = server_1.NextResponse.json({ message: "Logout successful" });
    response.headers.set("Set-Cookie", serializedCookie);
    return response;
}
