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
        const { groupId } = await req.json();
        if (!groupId || typeof groupId !== 'number') {
            return server_1.NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
        }
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
            select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
                isActive: true,
            },
        });
        if (!group) {
            return server_1.NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        return server_1.NextResponse.json({ group });
    }
    catch (error) {
        console.error('Error fetching group:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
