"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
async function POST(req) {
    try {
        const { name, email, mobileNumber, organizationId, createdById } = await req.json();
        if (!name || !email || !mobileNumber || !organizationId || !createdById) {
            return server_1.NextResponse.json({ error: "name, email, mobileNumber, organizationId, and createdById are required." }, { status: 400 });
        }
        // Check for duplicate email or mobileNumber
        const existingParticipant = await prisma_1.default.participant.findFirst({
            where: {
                OR: [
                    { email },
                    { mobileNumber }
                ]
            }
        });
        if (existingParticipant) {
            return server_1.NextResponse.json({ error: "Participant with this email or mobile number already exists." }, { status: 409 });
        }
        const password = generateRandomPassword();
        // Create participant
        const newParticipant = await prisma_1.default.participant.create({
            data: {
                name,
                email,
                mobileNumber,
                password,
                organizationId,
                createdById,
                approved: true,
            },
        });
        // Send email
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        await transporter.sendMail({
            from: `"exam-pro-credential" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your Exam Portal Account Credentials",
            text: `Hello ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nRegards,\nExam Pro Team`,
        });
        return server_1.NextResponse.json({
            message: "Participant created and email sent successfully.",
            participantId: newParticipant.id,
        });
    }
    catch (err) {
        console.error("Error creating participant:", err);
        return server_1.NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
function generateRandomPassword() {
    const min = 10000000;
    const max = 99999999;
    const randomBytes = crypto_1.default.randomBytes(4).readUInt32BE(0);
    const range = max - min + 1;
    return (min + (randomBytes % range)).toString();
}
