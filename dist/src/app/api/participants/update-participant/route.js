"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
async function PUT(req) {
    try {
        const { id, name, email, mobileNumber, updatedById } = await req.json();
        if (!id || !name || !email || !mobileNumber || !updatedById) {
            return server_1.NextResponse.json({
                error: "All fields (id, name, email, mobileNumber, updatedById) are required.",
            }, { status: 400 });
        }
        // Find participant
        const participant = await prisma_1.default.participant.findFirst({
            where: {
                id,
                visibility: true,
            },
        });
        if (!participant) {
            return server_1.NextResponse.json({ error: "Participant not found or already deleted." }, { status: 404 });
        }
        // Check for duplicate email (excluding current participant)
        const emailExists = await prisma_1.default.participant.findFirst({
            where: {
                email,
                id: { not: id },
                visibility: true,
            },
        });
        if (emailExists) {
            return server_1.NextResponse.json({ error: "Email already exists." }, { status: 400 });
        }
        // Check for duplicate mobile number (excluding current participant)
        const mobileExists = await prisma_1.default.participant.findFirst({
            where: {
                mobileNumber,
                id: { not: id },
                visibility: true,
            },
        });
        if (mobileExists) {
            return server_1.NextResponse.json({ error: "Mobile number already exists." }, { status: 400 });
        }
        // Perform the update
        await prisma_1.default.participant.update({
            where: { id },
            data: {
                name,
                email,
                mobileNumber,
                updatedById,
            },
        });
        return server_1.NextResponse.json({ message: "Participant updated successfully." });
    }
    catch (err) {
        console.error("Error updating participant:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
