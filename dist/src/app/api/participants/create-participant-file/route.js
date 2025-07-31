"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const XLSX = __importStar(require("xlsx"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
exports.config = {
    api: {
        bodyParser: false,
    },
};
async function POST(req) {
    try {
        // Parse form data
        const formData = await req.formData();
        const file = formData.get("file");
        const createdById = Number(formData.get("createdById"));
        const organizationId = Number(formData.get("organizationId"));
        if (!file || !organizationId || !createdById) {
            return server_1.NextResponse.json({ error: "File, organizationId and createdById are required." }, { status: 400 });
        }
        // Read Excel file
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const participantsData = XLSX.utils.sheet_to_json(worksheet);
        if (participantsData.length === 0) {
            return server_1.NextResponse.json({ error: "No participants found in file." }, { status: 400 });
        }
        // Extract emails and mobileNumbers for duplicate check
        const emails = participantsData.map((p) => p.email);
        const mobileNumbers = participantsData.map((p) => p.mobileNumber.toString());
        // Check for existing participants (DO NOT FILTER BY visibility)
        const existingParticipants = await prisma_1.default.participant.findMany({
            where: {
                OR: [
                    { email: { in: emails } },
                    { mobileNumber: { in: mobileNumbers } },
                ],
            },
            select: { email: true, mobileNumber: true },
        });
        const existingEmails = new Set(existingParticipants.map(p => p.email));
        const existingMobiles = new Set(existingParticipants.map(p => p.mobileNumber));
        // Prepare new participants
        const participantsArray = [];
        const emailPayload = [];
        for (const data of participantsData) {
            const { name, email, mobileNumber } = data;
            if (!name || !email || !mobileNumber)
                continue;
            if (existingEmails.has(email) || existingMobiles.has(mobileNumber.toString()))
                continue;
            const password = generateRandomPassword();
            participantsArray.push({
                name,
                email,
                mobileNumber: mobileNumber.toString(),
                password,
                organizationId,
                createdById,
                approved: true
            });
            emailPayload.push({
                name,
                email,
                password,
            });
        }
        if (participantsArray.length === 0) {
            return server_1.NextResponse.json({ error: "All participants already exist." }, { status: 400 });
        }
        // Phase 1: Insert participants
        await prisma_1.default.participant.createMany({
            data: participantsArray,
            skipDuplicates: false, // Already handled manually
        });
        // Phase 2: Send Emails
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        for (const { email, name, password } of emailPayload) {
            await transporter.sendMail({
                from: `"Exam Pro Credential" <${process.env.SMTP_EMAIL}>`,
                to: email,
                subject: "Your Exam Portal Account Credentials",
                text: `Hello ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password after first login.\n\nRegards,\nExam Pro Team`,
            });
        }
        return server_1.NextResponse.json({
            message: "Participants created and emails sent successfully.",
            totalNewParticipants: participantsArray.length,
        });
    }
    catch (err) {
        console.error("Error in participant upload:", err);
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
