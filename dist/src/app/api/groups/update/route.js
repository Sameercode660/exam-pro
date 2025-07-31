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
        const { groupId, adminId, name, description, startDate, endDate, isActive, } = await req.json();
        // Validation
        if (!groupId || typeof groupId !== 'number') {
            return server_1.NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
        }
        if (!adminId || typeof adminId !== 'number') {
            return server_1.NextResponse.json({ error: 'Invalid or missing adminId' }, { status: 400 });
        }
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return server_1.NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        const adminInfo = await prisma_1.default.user.findUnique({
            where: {
                id: adminId
            }
        });
        if (group.createdById !== adminId || adminInfo?.role !== 'Admin') {
            return server_1.NextResponse.json({ error: 'Unauthorized: You are not the creator of this group' }, { status: 403 });
        }
        // Build update payload
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (startDate)
            updateData.startDate = new Date(startDate);
        if (endDate)
            updateData.endDate = new Date(endDate);
        if (typeof isActive === 'boolean')
            updateData.isActive = isActive;
        const updatedGroup = await prisma_1.default.group.update({
            where: { id: groupId },
            data: updateData,
        });
        return server_1.NextResponse.json({
            message: 'Group updated successfully',
            group: updatedGroup,
        });
    }
    catch (error) {
        console.error('Error updating group:', error);
        return server_1.NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
