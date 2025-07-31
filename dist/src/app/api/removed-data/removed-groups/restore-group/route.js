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
        const { groupId, adminId } = await req.json();
        const restored = await prisma_1.default.group.update({
            where: { id: groupId },
            data: {
                visibility: true,
                updatedById: adminId,
                updatedAt: new Date(),
            },
        });
        return server_1.NextResponse.json({ success: true, data: restored });
    }
    catch (error) {
        console.error("Error restoring group:", error);
        return server_1.NextResponse.json({ success: false, message: "Restore failed" }, { status: 500 });
    }
}
