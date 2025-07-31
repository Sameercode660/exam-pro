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
        const { organizationId, adminId, filter, search, groupId } = await req.json();
        if (!organizationId || !adminId || !filter || !groupId) {
            return server_1.NextResponse.json({ error: "organizationId, adminId, groupId, and filter are required." }, { status: 400 });
        }
        let exams;
        if (filter === "all") {
            const admins = await prisma_1.default.user.findMany({
                where: { organizationId },
                select: { id: true, name: true },
            });
            const adminMap = Object.fromEntries(admins.map((admin) => [admin.id, admin.name]));
            const adminIds = admins.map((admin) => admin.id);
            const whereClause = {
                createdByAdminId: { in: adminIds },
                visibility: true,
            };
            if (search) {
                whereClause.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            const rawExams = await prisma_1.default.exam.findMany({
                where: whereClause,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                    createdByAdminId: true,
                    GroupExam: {
                        where: { groupId },
                        select: {
                            id: true,
                            visibility: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            exams = rawExams.map((exam) => {
                const groupExam = exam.GroupExam[0]; // Only one possible per group
                let status = "not_added";
                if (groupExam) {
                    status = groupExam.visibility ? "added" : "removed";
                }
                return {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    createdAt: exam.createdAt,
                    createdBy: adminMap[exam.createdByAdminId] || "Unknown",
                    status,
                };
            });
        }
        else if (filter === "my") {
            const whereClause = {
                createdByAdminId: adminId,
                visibility: true,
            };
            if (search) {
                whereClause.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            const rawExams = await prisma_1.default.exam.findMany({
                where: whereClause,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                    GroupExam: {
                        where: { groupId },
                        select: {
                            id: true,
                            visibility: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            exams = rawExams.map((exam) => {
                const groupExam = exam.GroupExam[0];
                let status = "not_added";
                if (groupExam) {
                    status = groupExam.visibility ? "added" : "removed";
                }
                return {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    createdAt: exam.createdAt,
                    createdBy: "Me",
                    status,
                };
            });
        }
        else {
            return server_1.NextResponse.json({ error: "Invalid filter." }, { status: 400 });
        }
        return server_1.NextResponse.json({ exams });
    }
    catch (error) {
        console.error(error);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
