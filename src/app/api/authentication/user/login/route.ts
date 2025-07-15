import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    // Find participant by email
    const participant = await prisma.participant.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    //checking whether participant exists or not
    if (!participant) {
      return NextResponse.json(
        { message: "Participant doesn't exists" },
        { status: 404 }
      );
    }
    //checking approval
    if (!participant?.approved) {
      return NextResponse.json(
        { message: "Your account is not yet approved." },
        { status: 403 }
      );
    }

    // comparing password
    if (participant.password !== password) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );
    }
    // Generate JWT
    const token = jwt.sign({ id: participant.id }, "Sameer", {
      expiresIn: "1d",
    });

    // Set token in cookie
    const serializedCookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    const response = NextResponse.json({
      message: "Login successful",
      participant,
      token,
    });
    response.headers.set("Set-Cookie", serializedCookie);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}
