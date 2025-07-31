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
        const body = await req.json();
        const { participantId, adminId } = body;
        if (!participantId) {
            return server_1.NextResponse.json({ success: false, message: "Participant ID is required" }, { status: 400 });
        }
        const participant = await prisma_1.default.participant.update({
            where: { id: participantId, updatedById: adminId },
            data: { visibility: true },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Participant restored successfully",
            data: participant,
        });
    }
    catch (error) {
        console.error("Error restoring participant:", error);
        return server_1.NextResponse.json({ success: false, message: "Failed to restore participant" }, { status: 500 });
    }
}
