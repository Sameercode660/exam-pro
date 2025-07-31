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
        const { groupId } = await req.json();
        const removedParticipants = await prisma_1.default.groupParticipant.findMany({
            where: {
                groupId,
                visibility: false,
            },
            select: {
                participantId: true,
                user: {
                    select: { name: true, email: true }
                }
            }
        });
        return server_1.NextResponse.json({
            participants: removedParticipants.map(p => ({
                id: p.participantId,
                name: p.user.name,
                email: p.user.email
            }))
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
