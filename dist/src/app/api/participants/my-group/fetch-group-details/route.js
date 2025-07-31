"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const zod_1 = require("zod");
const groupDetailSchema = zod_1.z.object({
    participantId: zod_1.z.number(),
    groupId: zod_1.z.number(),
});
async function POST(req) {
    try {
        const body = await req.json();
        const parseResult = groupDetailSchema.safeParse(body);
        if (!parseResult.success) {
            return server_1.NextResponse.json({ message: "Invalid input." }, { status: 400 });
        }
        const { participantId, groupId } = parseResult.data;
        // Fetch group
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
            include: {
                createdBy: true,
            },
        });
        if (!group || !group.isActive || !group.visibility) {
            return server_1.NextResponse.json({ message: "Group is not active or not visible." }, { status: 403 });
        }
        // Fetch participant
        const participant = await prisma_1.default.participant.findUnique({
            where: { id: participantId },
        });
        if (!participant || !participant.visibility) {
            return server_1.NextResponse.json({ message: "Participant is not active or has been removed." }, { status: 403 });
        }
        // Check groupParticipant relation
        const groupParticipant = await prisma_1.default.groupParticipant.findFirst({
            where: {
                participantId,
                groupId,
                visibility: true,
            },
        });
        if (!groupParticipant) {
            return server_1.NextResponse.json({ message: "You are not an active member of this group." }, { status: 403 });
        }
        // Fetch group participants
        const participants = await prisma_1.default.groupParticipant.findMany({
            where: {
                groupId,
                visibility: true,
                isActive: true,
            },
            include: {
                user: true,
            },
        });
        const participantList = participants.map((p) => ({
            participantId: p.user.id,
            name: p.user.name,
            email: p.user.email,
            mobileNumber: p.user.mobileNumber,
        }));
        // Fetch exams assigned to group
        const groupExams = await prisma_1.default.groupExam.findMany({
            where: { groupId, visibility: true },
            include: {
                exam: true,
            },
        });
        const examList = groupExams.map((ge) => ({
            examId: ge.exam.id,
            title: ge.exam.title,
            status: ge.exam.status, // Active | Scheduled
            examCode: ge.exam.examCode,
            startTime: ge.exam.startTime ? ge.exam.startTime.toISOString() : null, // Send startTime
        }));
        return server_1.NextResponse.json({
            message: "Group details fetched successfully.",
            group: {
                groupId: group.id,
                name: group.name,
                description: group.description,
                createdAt: group.createdAt,
                createdBy: group.createdBy.name,
            },
            participants: participantList,
            exams: examList,
        });
    }
    catch (error) {
        console.error("Error fetching group details:", error);
        return server_1.NextResponse.json({ message: "An error occurred while fetching group details." }, { status: 500 });
    }
}
