"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function DELETE(req) {
    try {
        const { groupId, participantId } = await req.json();
        if (!groupId || !participantId) {
            return server_1.NextResponse.json({ error: 'Group ID and Participant ID are required' }, { status: 400 });
        }
        const updated = await prisma_1.default.groupParticipant.update({
            where: {
                groupId_participantId: {
                    groupId: Number(groupId),
                    participantId: Number(participantId),
                },
            },
            data: {
                visibility: false,
            },
        });
        return server_1.NextResponse.json({ message: 'Participant visibility set to false', updated });
    }
    catch (err) {
        console.error('Error soft-deleting participant:', err);
        return server_1.NextResponse.json({ error: 'Failed to update participant visibility' }, { status: 500 });
    }
}
