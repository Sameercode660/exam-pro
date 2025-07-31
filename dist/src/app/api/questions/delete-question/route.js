"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function DELETE(req) {
    try {
        const { questionId, adminId } = await req.json();
        if (!questionId || !adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "questionId and adminId are required",
                status: false,
            });
        }
        const existingQuestion = await prisma_1.default.question.findFirst({
            where: {
                id: questionId,
                adminId: adminId,
                visibility: true,
            },
        });
        if (!existingQuestion) {
            return server_1.NextResponse.json({
                statusCode: 404,
                message: "Question does not exist or is already deleted",
                status: false,
            });
        }
        await prisma_1.default.question.update({
            where: { id: questionId },
            data: { visibility: false, updatedBy: adminId },
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Question deleted successfully",
            status: true,
        });
    }
    catch (error) {
        console.error("Error in DELETE request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "Something went wrong",
            status: false,
        });
    }
}
