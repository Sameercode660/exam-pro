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
        const { groupId, examId, adminId } = await req.json();
        // Validate inputs
        if (!groupId || !examId || !adminId) {
            return server_1.NextResponse.json({ error: "groupId, examId, and adminId are required." }, { status: 400 });
        }
        // Check if the group exists and is active
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group || !group.visibility) {
            return server_1.NextResponse.json({ error: "Group not found or inactive." }, { status: 404 });
        }
        // Check if the exam exists and is visible
        const exam = await prisma_1.default.exam.findUnique({
            where: { id: examId },
        });
        if (!exam || !exam.visibility) {
            return server_1.NextResponse.json({ error: "Exam not found or inactive." }, { status: 404 });
        }
        // Check for existing group-exam mapping
        const existing = await prisma_1.default.groupExam.findFirst({
            where: { groupId, examId },
        });
        if (existing) {
            if (existing.visibility === false) {
                return server_1.NextResponse.json({
                    message: "Exam exists in group but removed",
                    recoverRequired: true,
                });
            }
            return server_1.NextResponse.json({
                message: "Exam is already assigned to this group.",
                alreadyAssigned: true,
            });
        }
        // Create new group-exam mapping
        await prisma_1.default.groupExam.create({
            data: {
                groupId,
                examId,
                assignedBy: adminId,
            },
        });
        return server_1.NextResponse.json({
            message: "Exam successfully added to the group.",
            success: true,
        });
    }
    catch (err) {
        console.error("AddToGroup Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
