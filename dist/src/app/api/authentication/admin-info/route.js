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
        const { id } = await req.json();
        if (!id) {
            return server_1.NextResponse.json({
                statusCode: 400,
                messsage: "id is missing",
                status: false,
            });
        }
        const admin = await prisma_1.default.user.findUnique({
            where: { id },
            include: {
                createdExams: true,
                updatedExams: true,
                questions: true,
                IntResponse: true,
                Category: true,
                Topic: true,
            },
        });
        if (!admin) {
            return server_1.NextResponse.json({ statusCode: 400, message: "admin does not exist", status: false });
        }
        return server_1.NextResponse.json({ statusCode: 200, message: 'info fetched suffessfullly', response: admin, status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            return server_1.NextResponse.json({
                statusCode: 500,
                message: error.message,
                status: false,
            });
        }
        return server_1.NextResponse.json({
            statusCode: 500,
            message: "There is something wrong in fetching the admin info",
            status: false,
        });
    }
}
