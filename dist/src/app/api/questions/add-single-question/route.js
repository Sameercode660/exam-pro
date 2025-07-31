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
        const { categoryName, topicName, text, option1, option2, option3, option4, correctOption, difficultyLevel, adminId, } = await req.json();
        if (!categoryName ||
            !topicName ||
            !text ||
            !option1 ||
            !option2 ||
            !option3 ||
            !option4 ||
            !correctOption ||
            !adminId ||
            !difficultyLevel) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Anyone field is empty",
                status: false,
            });
        }
        // Check or create the category
        let category = await prisma_1.default.category.findFirst({
            where: { name: categoryName },
        });
        if (!category) {
            category = await prisma_1.default.category.create({
                data: { name: categoryName },
            });
        }
        // Check or create the topic
        let topic = await prisma_1.default.topic.findFirst({
            where: { name: topicName, categoryId: category.id },
        });
        if (!topic) {
            topic = await prisma_1.default.topic.create({
                data: { name: topicName, categoryId: category.id },
            });
        }
        // Insert the question and options
        const createdQuestion = await prisma_1.default.question.create({
            data: {
                text,
                categoryId: category.id,
                topicId: topic.id,
                difficulty: difficultyLevel.toUpperCase(),
                correctOption: correctOption,
                adminId,
                options: {
                    create: [
                        { text: option1, isCorrect: correctOption === 1 },
                        { text: option2, isCorrect: correctOption === 2 },
                        { text: option3, isCorrect: correctOption === 3 },
                        { text: option4, isCorrect: correctOption === 4 },
                    ],
                },
            },
        });
        console.log(`Created Question ID: ${createdQuestion.id}`);
        if (!createdQuestion) {
            return server_1.NextResponse.json({
                statusCode: 500,
                message: "Unable to created the question.",
                status: false,
            });
        }
        // insert into question frequency
        const questionFeq = await prisma_1.default.questionFrequency.create({
            data: {
                questionId: createdQuestion.id,
            },
        });
        if (!questionFeq) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Unable to create the entry in questionFrequency Table",
                status: false,
            });
        }
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Qeustion created successfully",
            response: createdQuestion,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in POST request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "An unexpected error occurred",
            status: false,
        });
    }
}
