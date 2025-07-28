import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }

 
    const user = await prisma.participant.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No user found with this email." },
        { status: 404 }
      );
    }

 
    const transporter = nodemailer.createTransport({
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

    return NextResponse.json(
      { message: "Password sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
