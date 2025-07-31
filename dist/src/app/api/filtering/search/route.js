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
        const questionTitle = req.nextUrl.searchParams.get("questionTitle") || "";
        const adminId = req.nextUrl.searchParams.get("adminId");
        if (!adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Admin ID is required",
                status: false,
            });
        }
        // Split the search term into individual words
        const searchTerms = questionTitle.split(" ").filter((term) => term.trim() !== "");
        // Prisma query to fetch questions
        const questions = await prisma_1.default.question.findMany({
            where: {
                AND: [
                    { adminId: parseInt(adminId) },
                    { visibility: true }, // Only visible questions
                    {
                        OR: searchTerms.map((term) => ({
                            text: {
                                contains: term,
                                mode: "insensitive", // Case-insensitive match
                            },
                        })),
                    },
                ],
            },
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
        console.error("Error in search API:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "Unexpected error",
            status: false,
        });
    }
}
