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
        const { organizationId } = await req.json();
        if (!organizationId || typeof organizationId !== "number") {
            return server_1.NextResponse.json({ error: "organizationId is required and must be a number." }, { status: 400 });
        }
        const unapprovedParticipants = await prisma_1.default.participant.findMany({
            where: {
                organizationId,
                approved: false,
                visibility: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                mobileNumber: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return server_1.NextResponse.json({
            data: unapprovedParticipants,
        });
    }
    catch (err) {
        console.error("Error fetching unapproved participants:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
