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
        const { organizationId } = await req.json();
        const visibleQuestions = await prisma_1.default.question.findMany({
            where: {
                visibility: false,
                admin: {
                    organizationId,
                },
            },
            include: {
                admin: {
                    select: {
                        name: true,
                    },
                },
                updatedByAdmin: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        const formatted = visibleQuestions.map((q) => ({
            id: q.id,
            title: q.text,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt,
            createdBy: q.admin?.name || null,
            removedBy: q.updatedByAdmin?.name || null,
        }));
        return server_1.NextResponse.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error("Error fetching visible questions:", error);
        return server_1.NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}
