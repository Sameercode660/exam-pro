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
        const { examId, adminId } = await req.json();
        if (!examId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "examId is required",
                status: false,
            });
        }
        const deletedExam = await prisma_1.default.exam.update({
            where: { id: adminId, createdByAdminId: adminId },
            data: {
                visibility: false
            }
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Exam deleted successfully",
            response: deletedExam,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in DELETE request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "Unexpected error",
            status: false,
        });
    }
}
