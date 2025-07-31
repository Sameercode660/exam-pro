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
        // fetching question id 
        const { questionId, adminId } = await req.json();
        // checking the questionId availability
        if (!questionId || !adminId) {
            return server_1.NextResponse.json({ statusCode: 400, message: 'Anyone field is empty', status: false });
        }
        // finding the question in db
        const question = await prisma_1.default.question.findUnique({
            where: {
                id: questionId,
                adminId
            },
            include: {
                category: true, // Includes the related category data
                topic: true, // Includes the related topic data
                options: true, // Includes the related options 
            },
        });
        // checking whether question does exist or not
        if (!question) {
            return server_1.NextResponse.json({ statusCode: 400, message: 'Question does not exist', status: false });
        }
        // sending the question as response 
        return server_1.NextResponse.json({ statusCode: 200, message: 'Message fetched successfully', response: question, status: true });
    }
    catch (error) {
        console.error("Error in POST request:", error);
        // catching the syntax error
        if (error instanceof SyntaxError) {
            return server_1.NextResponse.json({
                statusCode: 500,
                message: error.message,
                status: false,
            });
        }
        else if (error instanceof Error) {
            return server_1.NextResponse.json({
                statusCode: 500,
                message: error.message,
                status: false,
            });
        }
        else {
            // Generic error handling for unexpected errors
            return server_1.NextResponse.json({
                statusCode: 500,
                message: 'Something went wrong' + error,
                status: false,
            });
        }
    }
}
