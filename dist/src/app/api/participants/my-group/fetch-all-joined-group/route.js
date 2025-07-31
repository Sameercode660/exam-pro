"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const zod_1 = require("zod");
const fetchGroupSchema = zod_1.z.object({
    participantId: zod_1.z.number(),
});
async function POST(req) {
    try {
        const body = await req.json();
        const parseResult = fetchGroupSchema.safeParse(body);
        if (!parseResult.success) {
            return server_1.NextResponse.json({ message: "Invalid input. participantId is required." }, { status: 400 });
        }
        const { participantId } = parseResult.data;
        // Check participant visibility
        const participant = await prisma_1.default.participant.findUnique({
            where: { id: participantId },
        });
        if (!participant || !participant.visibility) {
            return server_1.NextResponse.json({ message: "Participant is not active or has been removed from the organization." }, { status: 403 });
        }
        // Fetch all groups participant has joined
        const groups = await prisma_1.default.groupParticipant.findMany({
            where: {
                participantId,
                isActive: true,
                group: {
                    visibility: true
                }
            },
            include: {
                group: {
                    include: {
                        createdBy: true,
                    },
                },
            },
        });
        if (groups.length === 0) {
            return server_1.NextResponse.json({ message: "No groups found." }, { status: 404 });
        }
        const groupData = groups.map((gp) => ({
            groupId: gp.group.id, // ✅ Return groupId
            groupName: gp.group.name,
            description: gp.group.description || "No description provided.",
            specialInstruction: gp.group.description || "No special instructions.",
            createdAt: gp.group.createdAt,
            createdBy: gp.group.createdBy.name,
            joinedAt: gp.assignedAt,
        }));
        return server_1.NextResponse.json({
            message: "Groups fetched successfully.",
            groups: groupData,
        });
    }
    catch (error) {
        console.error("Error fetching groups:", error);
        return server_1.NextResponse.json({ message: "An error occurred while fetching groups." }, { status: 500 });
    }
}
