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
        const { groupId, participantId } = await req.json();
        if (!groupId || !participantId) {
            return server_1.NextResponse.json({ error: "groupId and participantId are required" }, { status: 400 });
        }
        const existing = await prisma_1.default.groupParticipant.findUnique({
            where: {
                groupId_participantId: {
                    groupId,
                    participantId,
                },
            },
        });
        if (!existing) {
            return server_1.NextResponse.json({ error: "Participant not found in group" }, { status: 404 });
        }
        await prisma_1.default.groupParticipant.update({
            where: {
                groupId_participantId: {
                    groupId,
                    participantId,
                },
            },
            data: {
                visibility: false,
            },
        });
        return server_1.NextResponse.json({ message: "Participant removed successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("[REMOVE_GROUP_PARTICIPANT]", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
