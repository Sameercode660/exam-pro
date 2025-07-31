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
            return server_1.NextResponse.json({ error: 'adminId is required' }, { status: 400 });
        }
        const admin = await prisma_1.default.user.findUnique({
            where: { id: adminId },
            select: { organizationId: true },
        });
        if (!admin) {
            return server_1.NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }
        return server_1.NextResponse.json(admin);
    }
    catch (error) {
        console.error('Error fetching admin organization:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
