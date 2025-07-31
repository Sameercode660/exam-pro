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
        const body = await req.json();
        if (!body.organization || !body.user) {
            return server_1.NextResponse.json({ error: "Missing organization or user info" }, { status: 400 });
        }
        const { organization, user } = body;
        // ✅ 1. Check for existing organization
        const existingOrg = await prisma_1.default.organization.findUnique({
            where: {
                email: organization.email,
            },
        });
        if (existingOrg) {
            return server_1.NextResponse.json({ error: "Organization with this email already exists." }, { status: 400 });
        }
        // ✅ 2. Check if Admin email or phone already exists
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email: user.email }, { mobileNumber: user.mobileNumber }],
            },
        });
        if (existingUser) {
            return server_1.NextResponse.json({ error: "Admin with this email or mobile number already exists." }, { status: 400 });
        }
        // ✅ 3. Create Organization
        const org = await prisma_1.default.organization.create({
            data: {
                ...organization,
            },
        });
        // ✅ 4. Create Admin User
        const admin = await prisma_1.default.user.create({
            data: {
                ...user,
                role: "Admin",
                organizationId: org.id,
            },
        });
        // ✅ 5. Send Email with Credentials
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "privatething789736@gmail.com",
                pass: "ylpa stve wvnu tsly",
            },
        });
        const mailOptions = {
            from: '"Exam-Pro" <privatething789736@gmail.com>',
            to: user.email,
            subject: "Exam-Pro Credential",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 10px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome to Exam-Pro 🎓</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your admin account has been successfully created. Below are your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Password:</strong> ${user.password}</li>
          </ul>
          <p>Use these credentials to log in to your dashboard.</p>
          <p style="color: #888;">This is a system-generated email. Please do not reply.</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        return server_1.NextResponse.json({
            message: "Admin Created and Email Sent",
            admin,
            org,
        });
    }
    catch (error) {
        console.error("Create Admin Error:", error);
        return server_1.NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
