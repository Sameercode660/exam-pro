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
        const { name, email, mobileNumber, password, organizationId } = await req.json();
        // Validate inputs
        if (!name || !email || !mobileNumber || !password || !organizationId) {
            return server_1.NextResponse.json({
                error: "All fields are required: name, email, mobileNumber, password, organizationId.",
            }, { status: 400 });
        }
        // Check if participant already exists (email or mobileNumber)
        const existingParticipant = await prisma_1.default.participant.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { email: email.toLowerCase() },
                            { mobileNumber: mobileNumber },
                        ],
                    },
                ],
            },
        });
        if (existingParticipant) {
            return server_1.NextResponse.json({
                error: "Participant with this email or mobile number already exists.",
            }, { status: 409 });
        }
        // Insert new participant
        const newParticipant = await prisma_1.default.participant.create({
            data: {
                name,
                email: email.toLowerCase(),
                mobileNumber,
                password,
                organizationId,
                approved: false,
            },
        });
        return server_1.NextResponse.json({
            message: "Participant created successfully (pending approval).",
            participant: {
                id: newParticipant.id,
                name: newParticipant.name,
                email: newParticipant.email,
                mobileNumber: newParticipant.mobileNumber,
                approved: newParticipant.approved,
                organizationId: newParticipant.organizationId,
            },
        });
    }
    catch (err) {
        console.error("Error creating participant:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
