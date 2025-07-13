import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const createdById = Number(formData.get("createdById"));
    const organizationId = Number(formData.get("organizationId"));

    if (!file || !organizationId || !createdById) {
      return NextResponse.json(
        { error: "File, organizationId and createdById are required." },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const participantsData = XLSX.utils.sheet_to_json(worksheet);

    if (participantsData.length === 0) {
      return NextResponse.json({ error: "No participants found in file." }, { status: 400 });
    }

    // Extract emails and mobileNumbers for duplicate check
    const emails = participantsData.map((p: any) => p.email);
    const mobileNumbers = participantsData.map((p: any) => p.mobileNumber.toString());

    // Check for existing participants (DO NOT FILTER BY visibility)
    const existingParticipants = await prisma.participant.findMany({
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
    const participantsArray: {
      name: string;
      email: string;
      mobileNumber: string;
      password: string;
      organizationId: number;
      createdById: number;
    }[] = [];

    const emailPayload: {
      email: string;
      name: string;
      password: string;
    }[] = [];

    for (const data of participantsData) {
      const { name, email, mobileNumber } = data as {
        name: string;
        email: string;
        mobileNumber: string | number;
      };

      if (!name || !email || !mobileNumber) continue;

      if (existingEmails.has(email) || existingMobiles.has(mobileNumber.toString())) continue;

      const password = generateRandomPassword();

      participantsArray.push({
        name,
        email,
        mobileNumber: mobileNumber.toString(),
        password,
        organizationId,
        createdById,
      });

      emailPayload.push({
        name,
        email,
        password,
      });
    }

    if (participantsArray.length === 0) {
      return NextResponse.json({ error: "All participants already exist." }, { status: 400 });
    }

    // Phase 1: Insert participants
    await prisma.participant.createMany({
      data: participantsArray,
      skipDuplicates: false, // Already handled manually
    });

    // Phase 2: Send Emails
    const transporter = nodemailer.createTransport({
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

    return NextResponse.json({
      message: "Participants created and emails sent successfully.",
      totalNewParticipants: participantsArray.length,
    });

  } catch (err) {
    console.error("Error in participant upload:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

function generateRandomPassword() {
  const min = 10000000;
  const max = 99999999;
  const randomBytes = crypto.randomBytes(4).readUInt32BE(0);
  const range = max - min + 1;
  return (min + (randomBytes % range)).toString();
}
