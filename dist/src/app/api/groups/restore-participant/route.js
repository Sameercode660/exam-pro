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
        await prisma_1.default.groupParticipant.updateMany({
            where: { groupId, participantId },
            data: { visibility: true },
        });
        return server_1.NextResponse.json({ message: 'Participant restored successfully' });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
