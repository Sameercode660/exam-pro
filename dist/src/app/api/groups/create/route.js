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
        const body = await req.json();
        const { name, description, endDate, createdById, organizationId } = body;
        console.log(name, description, createdById, endDate, organizationId);
        if (!name || !endDate || !createdById || !organizationId) {
            return server_1.NextResponse.json({
                error: "Missing required fields: name, endDate, createdById, or organizationId.",
            }, { status: 400 });
        }
        const duplicateCheck = await prisma_1.default.group.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
                organizationId: organizationId,
                createdById: createdById,
            },
        });
        if (duplicateCheck) {
            return server_1.NextResponse.json({ error: "Group Already exists" }, { status: 400 });
        }
        const start = new Date();
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            return server_1.NextResponse.json({ error: "Invalid endDate format." }, { status: 400 });
        }
        if (start > end) {
            return server_1.NextResponse.json({ error: "startDate must be before endDate." }, { status: 400 });
        }
        const creator = await prisma_1.default.user.findUnique({
            where: { id: createdById },
        });
        if (!creator) {
            return server_1.NextResponse.json({ error: "CreatedBy user not found." }, { status: 404 });
        }
        const organization = await prisma_1.default.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            return server_1.NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }
        const newGroup = await prisma_1.default.group.create({
            data: {
                name,
                description,
                startDate: start,
                endDate: end,
                createdById,
                organizationId,
            },
        });
        return server_1.NextResponse.json({ message: "Group created successfully", group: newGroup }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating group:", error);
        return server_1.NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
