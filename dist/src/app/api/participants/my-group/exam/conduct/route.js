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
        const { examId } = await req.json();
        const parsedExamId = Number(examId);
        if (!parsedExamId || isNaN(parsedExamId)) {
            return server_1.NextResponse.json({ error: "examId is required and must be a valid number" }, { status: 400 });
        }
        // Fetch the exam details including timing and questions
        const exam = await prisma_1.default.exam.findUnique({
            where: { id: parsedExamId, visibility: true },
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: {
                            select: {
                                id: true,
                                text: true,
                                isCorrect: false, // Hide correct answers from participants
                            },
                        },
                    },
                },
            },
        });
        if (!exam) {
            return server_1.NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }
        if (exam.status == "Completed") {
            return server_1.NextResponse.json({ error: "Exam is already completed" }, { status: 400 });
        }
        // Use startTime and endTime directly from DB
        if (!exam.startTime || !exam.endTime) {
            return server_1.NextResponse.json({ error: "Exam timing is not set." }, { status: 400 });
        }
        return server_1.NextResponse.json({
            examId: exam.id,
            title: exam.title,
            duration: exam.duration,
            startTime: exam.startTime,
            endTime: exam.endTime,
            questions: exam.questions.map((q) => ({
                id: q.id,
                text: q.text,
                options: q.options.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                })),
            })),
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
