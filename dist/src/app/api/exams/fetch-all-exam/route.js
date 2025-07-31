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
        const { adminId } = await req.json();
        console.log(adminId);
        const exams = await prisma_1.default.exam.findMany({
            where: {
                createdByAdminId: adminId,
                visibility: true,
            },
            include: {
                createdBy: true,
                updatedBy: true,
            },
        });
        return server_1.NextResponse.json({
            statusCode: 200,
            message: "Exams fetched successfully",
            response: exams,
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
