"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    const body = await req.json();
    const { participantId } = body;
    if (!participantId) {
        return server_1.NextResponse.json({ error: 'participant id is not found' }, { status: 400 });
    }
    try {
        const entry = await prisma_1.default.participantTracking.create({
            data: {
                participantId,
                loginTime: new Date(),
                logoutTime: new Date(),
                spentTime: 0,
            },
        });
        return Response.json({ message: "Login tracked", entry });
    }
    catch (error) {
        console.error("Login Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
