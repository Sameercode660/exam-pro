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
        const { id, adminId, title, description, examCode, duration, status, startTime, endTime, updatedByAdminId, } = await req.json();
        if (!id || !adminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Exam ID and Admin ID are required",
                status: false,
            });
        }
        if (!duration) {
            return server_1.NextResponse.json({ error: 'duration is missing' }, { status: 400 });
        }
        const exam = await prisma_1.default.exam.findUnique({
            where: { id },
        });
        if (!exam || exam.createdByAdminId !== adminId) {
            return server_1.NextResponse.json({
                statusCode: 404,
                message: "Exam not found or unauthorized",
                status: false,
            });
        }
        let updateData = {
            title,
            description,
            examCode,
            duration,
            status,
            updatedByAdminId,
        };
        if (status === "Scheduled") {
            if (!startTime || !endTime) {
                return server_1.NextResponse.json({
                    statusCode: 400,
                    message: "StartTime and EndTime are required for Scheduled exams",
                    status: false,
                });
            }
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (end <= start) {
                return server_1.NextResponse.json({
                    statusCode: 400,
                    message: "EndTime must be after StartTime",
                    status: false,
                });
            }
            updateData.startTime = start;
            updateData.endTime = end;
        }
        else if (status === "Active") {
            const now = new Date();
            updateData.startTime = now;
            updateData.endTime = new Date(now.getTime() + duration * 60000);
        }
        else if (status === "Inactive") {
            updateData.startTime = null;
            updateData.endTime = null;
        }
        const updatedExam = await prisma_1.default.exam.update({
            where: { id },
            data: updateData,
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Exam updated successfully",
            response: updatedExam,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in PUT request:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error instanceof Error ? error.message : "Unexpected error",
            status: false,
        });
    }
}
