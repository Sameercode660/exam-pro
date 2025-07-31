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
        const { adminId, page = 1 } = await req.json();
        // Validate adminId
        if (!adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "adminId is required",
                status: false,
            });
        }
        const pageSize = 10; // Number of records per page
        const skip = (page - 1) * pageSize; // Calculate how many records to skip
        // Fetch paginated questions with admin details
        const questions = await prisma_1.default.question.findMany({
            where: { adminId: adminId, visibility: true },
            include: {
                category: true,
                topic: true,
                options: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            skip,
            take: pageSize,
        });
        // Get the total count of questions for pagination info
        const totalQuestions = await prisma_1.default.question.count({
            where: { adminId },
        });
        // Return the paginated questions
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Questions fetched successfully",
            response: {
                questions: questions.map((q) => ({
                    ...q,
                    createdByName: q.admin?.name || "Unknown",
                })),
                totalQuestions,
                page,
                pageSize,
            },
            status: true,
        });
    }
    catch (error) {
        console.error("Error in POST request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            status: false,
        });
    }
}
