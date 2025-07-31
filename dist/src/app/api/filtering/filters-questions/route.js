"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function GET(req) {
    try {
        // Parse query parameters
        const categoryId = req.nextUrl.searchParams.get("categoryId");
        const topicId = req.nextUrl.searchParams.get("topicId");
        const difficulty = req.nextUrl.searchParams.get("difficulty");
        // Build the filtering criteria
        const filters = { visibility: true };
        if (categoryId)
            filters.categoryId = parseInt(categoryId);
        if (topicId)
            filters.topicId = parseInt(topicId);
        if (difficulty)
            filters.difficulty = difficulty;
        // Fetch questions based on filters
        const questions = await prisma_1.default.question.findMany({
            where: filters,
            include: {
                category: true,
                topic: true,
                options: true,
            },
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Questions fetched successfully",
            response: questions,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in GET request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "Unexpected error",
            status: false,
        });
    }
}
