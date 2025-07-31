"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function PUT(req) {
    try {
        const body = await req.json();
        const { questionId, text, categoryName, topicName, difficulty, correctOption, options, adminId, } = body;
        // Validate input
        if (!questionId || !text || !categoryName || !topicName || !difficulty || !correctOption || !options || !adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "All fields are required.",
                status: false,
            });
        }
        // Check existing question
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            return server_1.NextResponse.json({
                statusCode: 404,
                message: "Question not found.",
                status: false,
            });
        }
        // Handle Category (upsert with composite unique constraint)
        const category = await prisma_1.default.category.upsert({
            where: {
                name_adminId: {
                    name: categoryName,
                    adminId: adminId,
                },
            },
            update: {},
            create: {
                name: categoryName,
                adminId: adminId,
            },
        });
        // Handle Topic (upsert with composite unique constraint)
        const topic = await prisma_1.default.topic.upsert({
            where: {
                name_categoryId_adminId: {
                    name: topicName,
                    categoryId: category.id,
                    adminId: adminId,
                },
            },
            update: {},
            create: {
                name: topicName,
                categoryId: category.id,
                adminId: adminId,
            },
        });
        // Update Question
        const updatedQuestion = await prisma_1.default.question.update({
            where: { id: questionId },
            data: {
                text,
                categoryId: category.id,
                topicId: topic.id,
                difficulty: difficulty,
                correctOption,
                options: {
                    deleteMany: {}, // Remove old options
                    create: options.map((opt, index) => ({
                        text: opt.text,
                        isCorrect: index + 1 === correctOption,
                    })),
                },
            },
            include: {
                category: true,
                topic: true,
                options: true,
            },
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Question updated successfully.",
            response: updatedQuestion,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in PUT request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error.message || "Internal Server Error",
            status: false,
        });
    }
}
