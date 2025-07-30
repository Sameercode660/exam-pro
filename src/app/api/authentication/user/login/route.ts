export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { z } from "zod";
import { userSchema } from "@/utils/dataValidation";

type RequestTypes = {
  email: string;
  password: string;
}

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

export async function POST(req: NextRequest) {
  const body: Partial<RequestTypes> = await req.json();
  const { email, password } = body;

  // Validate Email
  const emailValidation = userSchema.shape.email.safeParse(email);
  if (!emailValidation.success) {
    return NextResponse.json(
      { message: "Invalid email format." },
      { status: 400 }
    );
  }

  // Validate Password
  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  try {
    const participant = await prisma.participant.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { message: "Participant doesn't exist." },
        { status: 404 }
      );
    }

    if (participant.visibility === false) {
      return NextResponse.json(
        {
          message:
            "You have been removed from organization, request admin to add you again",
        },
        { status: 403 }
      );
    }

    if (!participant.approved) {
      return NextResponse.json(
        { message: "Your account is not yet approved." },
        { status: 403 }
      );
    }

    if (participant.password !== password) {
      return NextResponse.json(
        { message: "Invalid Password." },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: participant.id }, "Sameer", {
      expiresIn: "1d",
    });

    const serializedCookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
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
