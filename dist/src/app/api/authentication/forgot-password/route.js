"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const prisma_1 = __importDefault(require("@/utils/prisma"));
const nodemailer_1 = __importDefault(require("nodemailer"));
async function POST(req) {
    try {
        const { email } = await req.json();
        if (!email || typeof email !== "string") {
            return server_1.NextResponse.json({ message: "Email is required." }, { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return server_1.NextResponse.json({ message: "Invalid email format." }, { status: 400 });
        }
        const user = await prisma_1.default.participant.findUnique({
            where: { email },
        });
        if (!user) {
            return server_1.NextResponse.json({ message: "No user found with this email." }, { status: 404 });
        }
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        const mailOptions = {
            from: `"ExamPro Support" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your Account Password",
            html: `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your password is: <strong>${user.password}</strong></p>
        <p>Please keep it safe.</p>
        <p>Regards,<br/>ExamPro Team</p>
      `,
        };
        await transporter.sendMail(mailOptions);
        return server_1.NextResponse.json({ message: "Password sent to your email." }, { status: 200 });
    }
    catch (error) {
        console.error("Forgot Password API Error:", error);
        return server_1.NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
}
