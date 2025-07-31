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
        if (!adminId) {
            return server_1.NextResponse.json({ error: "adminId is required" }, { status: 400 });
        }
        const adminIdInt = adminId;
        // Fetch all required data in parallel
        const [totalExams, activeExams, inactiveExams, totalQuestions, totalCategories, totalTopics, adminInfo,] = await Promise.all([
            prisma_1.default.exam.count({ where: { createdByAdminId: adminIdInt, visibility: true } }),
            prisma_1.default.exam.count({ where: { createdByAdminId: adminIdInt, status: "active", visibility: true } }),
            prisma_1.default.exam.count({ where: { createdByAdminId: adminIdInt, status: "inactive", visibility: true } }),
            prisma_1.default.question.count({ where: { adminId: adminIdInt, visibility: true } }),
            prisma_1.default.category.count({ where: { adminId: adminIdInt } }),
            prisma_1.default.topic.count({ where: { adminId: adminIdInt } }),
            prisma_1.default.user.findUnique({ where: { id: adminIdInt } }),
        ]);
        console.log(activeExams, inactiveExams);
        // Construct response
        const dashboardData = {
            adminInfo,
            totalExams,
            activeExams,
            inactiveExams,
            totalQuestions,
            totalCategories,
            totalTopics,
        };
        return server_1.NextResponse.json(dashboardData);
    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
