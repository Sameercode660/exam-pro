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
const zod_1 = require("zod");
const dataValidation_1 = require("@/utils/dataValidation");
const passwordSchema = zod_1.z.string().min(8, "Password must be at least 8 characters long");
async function POST(req) {
    const body = await req.json();
    const { email, password } = body;
    // Validate Email
    const emailValidation = dataValidation_1.userSchema.shape.email.safeParse(email);
    if (!emailValidation.success) {
        return server_1.NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }
    // Validate Password
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
        return server_1.NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }
    try {
        const participant = await prisma_1.default.participant.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: "insensitive",
                },
            },
        });
        if (!participant) {
            return server_1.NextResponse.json({ message: "Participant doesn't exist." }, { status: 404 });
        }
        if (participant.visibility === false) {
            return server_1.NextResponse.json({
                message: "You have been removed from organization, request admin to add you again",
            }, { status: 403 });
        }
        if (!participant.approved) {
            return server_1.NextResponse.json({ message: "Your account is not yet approved." }, { status: 403 });
        }
        if (participant.password !== password) {
            return server_1.NextResponse.json({ message: "Invalid Password." }, { status: 401 });
        }
        const token = jsonwebtoken_1.default.sign({ id: participant.id }, "Sameer", {
            expiresIn: "1d",
        });
        const serializedCookie = (0, cookie_1.serialize)("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24,
            path: "/",
        });
        const response = server_1.NextResponse.json({
            message: "Login successful",
            participant,
            token,
        });
        response.headers.set("Set-Cookie", serializedCookie);
        return response;
    }
    catch (error) {
        console.error("Login error:", error);
        return server_1.NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
}
