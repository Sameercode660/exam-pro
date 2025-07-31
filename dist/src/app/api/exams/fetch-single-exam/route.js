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
        if (!examId || !adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "examId is required",
                status: false,
            });
        }
        const exam = await prisma_1.default.exam.findUnique({
            where: { id: examId, createdByAdminId: adminId, visibility: true },
            include: {
                createdBy: true,
                updatedBy: true,
            },
        });
        if (!exam) {
            return server_1.NextResponse.json({
                statusCode: 404,
                message: "Exam not found",
                status: false,
            });
        }
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Exam fetched successfully",
            response: exam,
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
