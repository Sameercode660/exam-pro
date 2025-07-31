"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function POST(request) {
    const { organizationId, search = "" } = await request.json();
    const inactiveExams = await prisma_1.default.exam.findMany({
        where: {
            createdBy: {
                organizationId
            },
            status: 'Inactive',
            title: {
                contains: search,
                mode: "insensitive",
            },
        },
        include: {
            createdBy: {
                select: {
                    name: true,
                },
            },
        },
    });
    return server_1.NextResponse.json({ data: inactiveExams });
}
