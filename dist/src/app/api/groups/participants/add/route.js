"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
// POST /api/groups/participants
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(req) {
    try {
        const { groupId, participantId, userId } = await req.json();
        if (!groupId || !participantId) {
            return server_1.NextResponse.json({ error: "Group ID and Participant ID are required" }, { status: 400 });
        }
        const existing = await prisma_1.default.groupParticipant.findUnique({
            where: {
                groupId_participantId: {
                    groupId: Number(groupId),
                    participantId: Number(participantId),
                },
            },
        });
        if (existing) {
            return server_1.NextResponse.json({ error: "Participant already in group" }, { status: 409 });
        }
        const added = await prisma_1.default.groupParticipant.create({
            data: {
                groupId: Number(groupId),
                participantId: Number(participantId),
                userId: userId ? Number(userId) : null,
            },
        });
        return server_1.NextResponse.json(added);
    }
    catch (err) {
        console.error("Error adding participant:", err);
        return server_1.NextResponse.json({ error: "Failed to add participant" }, { status: 500 });
    }
}
