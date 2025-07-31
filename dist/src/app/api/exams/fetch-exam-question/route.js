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
        const { examId } = body;
        // Validate the input
        if (!examId) {
            return server_1.NextResponse.json({ error: "examId is required." }, { status: 400 });
        }
        // Fetch the exam and its questions
        const exam = await prisma_1.default.exam.findUnique({
            where: {
                id: Number(examId),
            },
            include: {
                questions: {
                    where: { visibility: true }, // Only include questions with visibility = true
                    include: {
                        topic: true, // Include topic information
                        category: true, // Include category information
                        options: true, // Include options for each question
                    },
                },
            },
        });
        if (!exam) {
            return server_1.NextResponse.json({ error: "Exam not found." }, { status: 404 });
        }
        // Ensure the exam itself is visible
        if (!exam.visibility) {
            return server_1.NextResponse.json({ error: "This exam is not visible." }, { status: 403 });
        }
        return server_1.NextResponse.json({
            message: "Questions fetched successfully.",
            examId: exam.id,
            title: exam.title,
            description: exam.description,
            questions: exam.questions,
        }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching exam questions:", error);
        return server_1.NextResponse.json({ error: "An error occurred while fetching the exam questions." }, { status: 500 });
    }
}
