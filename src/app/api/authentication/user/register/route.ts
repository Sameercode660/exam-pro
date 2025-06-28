import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password, mobileNumber } = await req.json();

  if (!name || !email || !password || !mobileNumber) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  try {
    // Check if the email or mobile number already exists
    const existingUser = await prisma.participant.findFirst({
      where: { OR: [{ email }, { mobileNumber }] },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email or Mobile Number already exists." }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create participant
    const participant = await prisma.participant.create({
      data: { name, email, password: hashedPassword, mobileNumber },
    });

    return NextResponse.json({ message: "Signup successful", participant }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
