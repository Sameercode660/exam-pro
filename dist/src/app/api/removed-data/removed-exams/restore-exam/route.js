"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(request) {
    try {
        const body = await request.json();
        const { examId, userId } = body;
        console.log(examId, userId);
        if (!examId || !userId) {
            return server_1.NextResponse.json({ error: "examId and userId are required" }, { status: 400 });
        }
        const updatedExam = await prisma_1.default.exam.update({
            where: {
                id: Number(examId),
            },
            data: {
                visibility: true,
                updatedByAdminId: Number(userId),
            },
        });
        return server_1.NextResponse.json({ message: "Exam restored successfully", exam: updatedExam }, { status: 200 });
    }
    catch (error) {
        console.error("Failed to restore exam:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
