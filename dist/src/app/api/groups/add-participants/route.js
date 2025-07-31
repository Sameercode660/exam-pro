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
        const { groupId, participantIds } = await req.json();
        if (!groupId || !Array.isArray(participantIds)) {
            return server_1.NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }
        // Find participants already in the group, along with their names
        const existingGroupParticipants = await prisma_1.default.groupParticipant.findMany({
            where: {
                groupId,
                participantId: { in: participantIds },
            },
            select: {
                participantId: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        const existingIds = existingGroupParticipants.map((p) => p.participantId);
        // Filter new participants
        const newParticipants = participantIds.filter((id) => !existingIds.includes(id));
        // Batch insert new participants
        if (newParticipants.length > 0) {
            await prisma_1.default.groupParticipant.createMany({
                data: newParticipants.map((id) => ({
                    groupId,
                    participantId: id,
                })),
                skipDuplicates: true, // Extra safety
            });
        }
        // Extract skipped participant names
        const skippedParticipantNames = existingGroupParticipants.map((p) => p.user.name);
        return server_1.NextResponse.json({
            message: "Participants processed",
            addedCount: newParticipants.length,
            skippedCount: skippedParticipantNames.length,
            skippedParticipants: skippedParticipantNames, // Array of names
        });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
