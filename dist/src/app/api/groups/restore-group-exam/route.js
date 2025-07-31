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
        const { groupId, examId } = await req.json();
        if (!groupId || !examId) {
            return server_1.NextResponse.json({ error: "groupId and examId are required." }, { status: 400 });
        }
        // Check if soft-deleted mapping exists
        const groupExam = await prisma_1.default.groupExam.findFirst({
            where: {
                groupId,
                examId,
                visibility: false,
            },
        });
        if (!groupExam) {
            return server_1.NextResponse.json({ error: "No soft-deleted mapping found for this exam in the group." }, { status: 404 });
        }
        // Restore the exam by setting visibility to true
        await prisma_1.default.groupExam.update({
            where: {
                groupId_examId: { groupId, examId },
            },
            data: {
                visibility: true,
            },
        });
        return server_1.NextResponse.json({
            message: "Exam successfully restored to the group.",
            success: true,
        });
    }
    catch (err) {
        console.error("RestoreGroupExam Error:", err);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
