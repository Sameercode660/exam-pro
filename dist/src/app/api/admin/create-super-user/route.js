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
        const { name, email, mobileNumber, password, createdById, organizationId } = await req.json();
        if (!name || !email || !mobileNumber || !password || !createdById || !organizationId) {
            return server_1.NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const newUser = await prisma_1.default.user.create({
            data: {
                name,
                email,
                mobileNumber,
                password,
                role: 'SuperUser',
                organizationId,
                createdById,
            },
        });
        return server_1.NextResponse.json(newUser);
    }
    catch (error) {
        if (error instanceof Error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error('Error creating superuser:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
