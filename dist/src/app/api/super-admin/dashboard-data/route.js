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
        const admin = await prisma_1.default.user.findFirst({
            where: { id: adminId, role: 'SuperAdmin' },
            select: {
                id: true,
                name: true,
                email: true,
                mobileNumber: true,
                role: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalAdmins = await prisma_1.default.user.count({
            where: {
                role: {
                    in: ['Admin'],
                },
            },
        });
        const totalOrganizations = await prisma_1.default.organization.count();
        return server_1.NextResponse.json({ admin, totalAdmins, totalOrganizations });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
