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
        const { groupId, requesterId } = await req.json();
        // Validate input
        if (!groupId || typeof groupId !== 'number') {
            return server_1.NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
        }
        if (!requesterId || typeof requesterId !== 'number') {
            return server_1.NextResponse.json({ error: 'Invalid or missing requesterId' }, { status: 400 });
        }
        // Fetch group
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return server_1.NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        // Fetch requester details
        const requester = await prisma_1.default.user.findUnique({
            where: { id: requesterId },
        });
        if (!requester) {
            return server_1.NextResponse.json({ error: 'Requester user not found' }, { status: 404 });
        }
        // Only allow if requester is SuperAdmin OR creator of the group
        const isAdmin = requester.role === 'SuperAdmin' || requester.role === 'Admin';
        const isCreator = group.createdById === requester.id;
        if (!(isAdmin || isCreator)) {
            return server_1.NextResponse.json({ error: 'Unauthorized to delete this group' }, { status: 403 });
        }
        // Perform soft delete (visibility = false)
        const updatedGroup = await prisma_1.default.group.update({
            where: { id: groupId },
            data: { visibility: false, updatedById: requesterId },
        });
        return server_1.NextResponse.json({
            message: 'Group soft-deleted successfully',
            group: updatedGroup,
        });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
