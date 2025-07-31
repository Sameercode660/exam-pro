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
        const removedGroups = await prisma_1.default.group.findMany({
            where: {
                visibility: false,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        const formatted = removedGroups.map((group) => ({
            id: group.id,
            name: group.name,
            createdAt: group.createdAt,
            removedAt: group.updatedAt,
            createdBy: group.createdBy?.name || "-",
            removedBy: group.updatedBy?.name || "-",
        }));
        return server_1.NextResponse.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error("Error fetching removed groups:", error);
        return server_1.NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}
