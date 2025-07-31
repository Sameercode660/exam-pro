"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const prisma_1 = __importDefault(require("@/utils/prisma"));
const prisma_2 = require("@/generated/prisma");
async function POST(req) {
    try {
        const body = await req.json();
        const { organizationId } = body;
        if (!organizationId) {
            return new Response("organizationId is required", { status: 400 });
        }
        const [totalSuperUsers, totalParticipants, totalExams, totalQuestions, activeExams, inactiveExams,] = await Promise.all([
            // Super Users directly tied to organization
            prisma_1.default.user.count({
                where: {
                    organizationId,
                    role: prisma_2.RoleEnum.SuperUser,
                },
            }),
            // Participants directly tied to organization
            prisma_1.default.participant.count({
                where: {
                    organizationId,
                },
            }),
            // Exams created by users who belong to this org
            prisma_1.default.exam.count({
                where: {
                    createdBy: {
                        organizationId,
                    },
                },
            }),
            // Questions created by users who belong to this org
            prisma_1.default.question.count({
                where: {
                    admin: {
                        organizationId,
                    },
                },
            }),
            // Active Exams by org users
            prisma_1.default.exam.count({
                where: {
                    status: 'Active',
                    createdBy: {
                        organizationId,
                    },
                },
            }),
            // Inactive Exams by org users
            prisma_1.default.exam.count({
                where: {
                    status: 'Inactive',
                    createdBy: {
                        organizationId,
                    },
                },
            }),
        ]);
        return Response.json({
            totalSuperUsers,
            totalParticipants,
            totalExams,
            totalQuestions,
            activeExams,
            inactiveExams,
        });
    }
    catch (error) {
        console.error("Error fetching org stats:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
