import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import nodemailer from "nodemailer";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const {
      organization,
      user,
    }: {
      organization: {
        name: string;
        email: string;
        phone: string;
        address: string;
        State: string;
        Country: string;
        CountryCode: string;
      };
      user: {
        name: string;
        email: string;
        mobileNumber: string;
        password: string;
        createdById: number;
      };
    } = await req.json();

    // ✅ 1. Check for existing organization
    const existingOrg = await prisma.organization.findUnique({
      where: {
        email: organization.email,
      },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization with this email already exists." },
        { status: 400 }
      );
    }

    // ✅ 2. Check if Admin email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { mobileNumber: user.mobileNumber },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin with this email or mobile number already exists." },
        { status: 400 }
      );
    }

    // ✅ 3. Create Organization
    const org = await prisma.organization.create({
      data: {
        ...organization,
      },
    });

    // ✅ 4. Create Admin User
    const hashedPassword = await hash(user.password, 10);
    const admin = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
        role: "Admin",
        organizationId: org.id,
      },
    });

    // ✅ 5. Send Email with Credentials
    const transporter = nodemailer.createTransport({
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

    return NextResponse.json({ message: "Admin Created and Email Sent", admin, org });
  } catch (error) {
    console.error("Create Admin Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
