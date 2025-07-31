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
        const { examId, questionId } = body;
        // Validate inputs
        if (!examId || !questionId) {
            return server_1.NextResponse.json({ error: "examId and questionId are required." }, { status: 400 });
        }
        // Fetch the exam to ensure it exists
        const exam = await prisma_1.default.exam.findUnique({
            where: { id: Number(examId) },
            include: { questions: true }, // Include questions to verify relationships
        });
        if (!exam) {
            return server_1.NextResponse.json({ error: "Exam not found." }, { status: 404 });
        }
        // Check if the question is part of the exam
        const questionExists = exam.questions.some((q) => q.id === Number(questionId));
        if (!questionExists) {
            return server_1.NextResponse.json({ error: "The specified question is not associated with this exam." }, { status: 400 });
        }
        // Remove the question from the exam
        await prisma_1.default.exam.update({
            where: { id: Number(examId) },
            data: {
                questions: {
                    disconnect: { id: Number(questionId) }, // Disconnect the question
                },
            },
        });
        return server_1.NextResponse.json({ message: "Question removed from the exam successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("Error removing question from exam:", error);
        return server_1.NextResponse.json({ error: "An error occurred while removing the question from the exam." }, { status: 500 });
    }
}
