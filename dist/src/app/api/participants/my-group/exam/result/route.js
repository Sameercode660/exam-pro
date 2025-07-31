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
        const { examId, userId } = await req.json();
        const parsedExamId = Number(examId);
        const parsedUserId = Number(userId);
        if (!parsedExamId || isNaN(parsedExamId)) {
            return server_1.NextResponse.json({ status: false, message: "Invalid examId" }, { status: 400 });
        }
        if (!parsedUserId || isNaN(parsedUserId)) {
            return server_1.NextResponse.json({ status: false, message: "Invalid userId" }, { status: 400 });
        }
        // Fetch all responses of this user for the exam, include question text
        const responses = await prisma_1.default.response.findMany({
            where: {
                examId: parsedExamId,
                userId: parsedUserId,
            },
            select: {
                questionId: true,
                selectedOption: true,
                isCorrect: true,
                question: {
                    select: {
                        text: true,
                        correctOption: true,
                        options: {
                            select: {
                                id: true,
                                text: true,
                            },
                        },
                    },
                },
            },
        });
        const totalAttempted = responses.length;
        const totalCorrect = responses.filter((r) => r.isCorrect).length;
        const totalWrong = totalAttempted - totalCorrect;
        const correctAnswers = responses
            .filter((r) => r.isCorrect)
            .map((r) => ({
            questionId: r.questionId,
            questionText: r.question.text,
            yourAnswer: r.question.options[r.selectedOption - 1]?.text || "N/A",
            correctAnswer: r.question.options[r.question.correctOption - 1]?.text || "N/A",
            status: "correct",
        }));
        const wrongAnswers = responses
            .filter((r) => !r.isCorrect)
            .map((r) => ({
            questionId: r.questionId,
            questionText: r.question.text,
            yourAnswer: r.question.options[r.selectedOption - 1]?.text || "N/A",
            correctAnswer: r.question.options[r.question.correctOption - 1]?.text || "N/A",
            status: "wrong",
        }));
        const percentage = totalAttempted > 0
            ? Math.round((totalCorrect / totalAttempted) * 100)
            : 0;
        // Save result
        await prisma_1.default.result.upsert({
            where: {
                userId_examId: {
                    userId: parsedUserId,
                    examId: parsedExamId,
                },
            },
            update: {
                score: totalCorrect,
                total: totalAttempted,
            },
            create: {
                userId: parsedUserId,
                examId: parsedExamId,
                score: totalCorrect,
                total: totalAttempted,
            },
        });
        return server_1.NextResponse.json({
            status: true,
            message: "Result calculated successfully",
            data: {
                totalAttempted,
                totalCorrect,
                totalWrong,
                percentage,
                correctAnswers,
                wrongAnswers,
            },
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({
            status: false,
            message: err.message || "Server Error",
        }, { status: 500 });
    }
}
