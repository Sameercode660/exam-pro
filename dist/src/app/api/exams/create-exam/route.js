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
        const body = await req.json();
        const { title, description, examCode, status, createdByAdminId, duration, startTime, } = body;
        // Basic Validation
        if (!title || !examCode || !createdByAdminId) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Required fields are missing",
                status: false,
            });
        }
        if (!duration || duration <= 0) {
            return server_1.NextResponse.json({
                statusCode: 400,
                message: "Invalid duration",
                status: false,
            });
        }
        let finalStatus = status || '';
        let finalStartTime = null;
        let finalEndTime = null;
        // Logic based on status
        if (status === "Scheduled") {
            if (!startTime) {
                return server_1.NextResponse.json({
                    statusCode: 400,
                    message: "Start time is required for scheduled exams",
                    status: false,
                });
            }
            finalStartTime = new Date(startTime);
            if (isNaN(finalStartTime.getTime())) {
                return server_1.NextResponse.json({
                    statusCode: 400,
                    message: "Invalid start time format",
                    status: false,
                });
            }
            finalEndTime = new Date(finalStartTime.getTime() + duration * 60000);
            if (finalEndTime <= finalStartTime) {
                return server_1.NextResponse.json({
                    statusCode: 400,
                    message: "End time must be after start time",
                    status: false,
                });
            }
            finalStatus = "Scheduled"; // Force it just in case
        }
        else if (status === "Active") {
            // For Active exam: start now, end after duration
            finalStartTime = new Date();
            finalEndTime = new Date(finalStartTime.getTime() + duration * 60000);
            finalStatus = "Active";
        }
        else if (status === "Inactive") {
            // For Inactive: only store duration, times are null
            finalStartTime = null;
            finalEndTime = null;
            finalStatus = "Inactive";
        }
        // Create Exam
        const newExam = await prisma_1.default.exam.create({
            data: {
                title,
                description: description || "",
                examCode,
                duration,
                status: finalStatus,
                startTime: finalStartTime,
                endTime: finalEndTime,
                createdByAdminId,
                updatedByAdminId: createdByAdminId,
                createdById: createdByAdminId,
            },
        });
        return server_1.NextResponse.json({
            statusCode: 201,
            message: "Exam created successfully",
            response: newExam,
            status: true,
        });
    }
    catch (error) {
        console.error("Error in create-exam API:", error);
        return server_1.NextResponse.json({
            statusCode: 500,
            message: error.message || "Internal Server Error",
            status: false,
        });
    }
}
