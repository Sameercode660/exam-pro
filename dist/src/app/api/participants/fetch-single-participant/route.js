"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    try {
        const { participantId } = await req.json();
        if (!participantId) {
            return server_1.NextResponse.json({ error: "participantId is required." }, { status: 400 });
        }
        const participant = await prisma_1.default.participant.findUnique({
            where: { id: participantId },
            select: {
                id: true,
                name: true,
                email: true,
                mobileNumber: true,
                approved: true,
                active: true,
                visibility: true,
                organizationId: true,
                createdById: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!participant) {
            return server_1.NextResponse.json({ error: "Participant not found." }, { status: 404 });
        }
        return server_1.NextResponse.json({ participant });
    }
    catch (err) {
        console.error("Error fetching participant:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
