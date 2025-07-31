"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function GET() {
    try {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingExams = await prisma_1.default.scheduledExamBuffer.findMany({
            where: {
                startTime: {
                    gte: now,
                    lte: sevenDaysLater,
                },
            },
            select: {
                examId: true,
                startTime: true,
                endTime: true,
            },
        });
        const examIds = upcomingExams.map((exam) => exam.examId);
        if (examIds.length > 0) {
            await prisma_1.default.scheduledExamBuffer.updateMany({
                where: {
                    id: { in: examIds },
                },
                data: {
                    processed: true,
                },
            });
        }
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Fetched upcoming exams from buffer successfully",
            data: upcomingExams,
            status: true,
        });
    }
    catch (err) {
        console.error(err);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: err.message || "Internal Server Error",
            status: false,
        });
    }
}
