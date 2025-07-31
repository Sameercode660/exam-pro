"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(request) {
    try {
        const body = await request.json();
        const { organizationId } = body;
        if (!organizationId) {
            return server_1.NextResponse.json({ error: "organizationId is required" }, { status: 400 });
        }
        const removedExams = await prisma_1.default.exam.findMany({
            where: {
                visibility: false,
                createdBy: {
                    organizationId: Number(organizationId),
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: { name: true },
                },
                updatedBy: {
                    select: { name: true },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        const formatted = removedExams.map((exam) => ({
            id: exam.id,
            name: exam.title,
            description: exam.description,
            duration: exam.duration,
            createdBy: exam.createdBy?.name || "-",
            removedBy: exam.updatedBy?.name || "-",
            createdAt: exam.createdAt,
            removedAt: exam.updatedAt,
        }));
        return server_1.NextResponse.json({ data: formatted }, { status: 200 });
    }
    catch (error) {
        console.error("Failed to fetch removed exams:", error);
        return server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
