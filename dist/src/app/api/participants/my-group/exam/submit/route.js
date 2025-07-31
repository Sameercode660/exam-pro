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
        const { examId, answers, userId } = await req.json();
        if (!examId || !answers || userId) {
            return server_1.NextResponse.json({ error: 'Anyone field in input is missing' }, { status: 400 });
        }
        const parsedExamId = Number(examId);
        const parsedUserId = Number(userId);
        if (!parsedExamId || isNaN(parsedExamId)) {
            return server_1.NextResponse.json({ statusCode: 400, message: "Invalid examId", status: false });
        }
        if (!parsedUserId || isNaN(parsedUserId)) {
            return server_1.NextResponse.json({ statusCode: 400, message: "Invalid userId", status: false });
        }
        const exam = await prisma_1.default.exam.findUnique({
            where: { id: parsedExamId },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
        if (!exam) {
            return server_1.NextResponse.json({ statusCode: 404, message: "Exam not found", status: false });
        }
        // Prepare responses
        const responses = exam.questions.map((q) => {
            const selectedOption = answers[q.id];
            if (selectedOption === undefined) {
                return null; // Not attempted
            }
            const isCorrect = Number(selectedOption) === q.correctOption;
            return {
                userId: parsedUserId,
                examId: parsedExamId,
                questionId: q.id,
                selectedOption: Number(selectedOption),
                isCorrect,
            };
        }).filter((item) => item !== null);
        if (responses.length === 0) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "No answers provided",
                status: false,
            });
        }
        // Delete old responses (for re-attempt/backlog scenario)
        await prisma_1.default.response.deleteMany({
            where: {
                examId: parsedExamId,
                userId: parsedUserId,
            },
        });
        // Insert new responses
        await prisma_1.default.response.createMany({
            data: responses,
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Responses submitted successfully (Previous attempt overwritten)",
            status: true,
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: err.message || "Server Error",
            status: false,
        });
    }
}
