"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = void 0;
exports.POST = POST;
exports.runtime = "nodejs";
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = require("cookie");
async function POST(req) {
    try {
        const { email, password } = await req.json();
        // Validate input
        if (!email || !password) {
            return server_1.NextResponse.json({ message: "Email and password are required." }, { status: 400 });
        }
        // Find user by email
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: {
                Organization: true,
            },
        });
        if (!user || user.password !== password) {
            return server_1.NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "Sameer", { expiresIn: "1d" });
        // Serialize cookie
        const cookie = (0, cookie_1.serialize)("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        const response = server_1.NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
        });
        response.headers.set("Set-Cookie", cookie);
        return response;
    }
    catch (error) {
        console.error("Login error:", error);
        return server_1.NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
