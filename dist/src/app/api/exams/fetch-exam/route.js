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
        const { createdBy } = await req.json();
        const exams = await prisma_1.default.exam.findMany({
            where: {
                createdById: createdBy
            }
        });
        if (!exams || exams.length == 0) {
            return server_1.NextResponse.json({ statusCode: 404, message: 'No any exam is found', response: [], status: false });
        }
        return server_1.NextResponse.json({ statusCode: 200, message: 'Exam fetched successfully', response: exams, status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            return server_1.NextResponse.json({ statusCode: 500, message: error.message, status: false });
        }
        console.log(error);
        return server_1.NextResponse.json({ statusCode: 500, message: 'Unknown error occurred', status: false });
    }
}
