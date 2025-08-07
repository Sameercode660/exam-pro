import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { ParticipantStagingStatus } from "@/generated/prisma";

type Participant = {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  organizationId: number;
  createdById: number;
  approved: boolean;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
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

    // Read Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: "No participants found in file." },
        { status: 400 }
      );
    }

    // Phase 1: Upload to staging
    const stagingRecords = rawData.map((row: any) => ({
      name: String(row.name || "").trim(),
      email: String(row.email || "")
        .trim()
        .toLowerCase(),
      mobileNumber: String(row.mobileNumber || "").trim(),
      password: generateRandomPassword(),
      organizationId,
      createdById,
      status: ParticipantStagingStatus.PENDING,
    }));

    await prisma.stagingParticipant.createMany({ data: stagingRecords });

    // Fetch back pending rows
    const pendingRows = await prisma.stagingParticipant.findMany({
      where: { status: "PENDING", organizationId, createdById },
    });

    // Check for duplicates
    const emails = pendingRows.map((p) => p.email);
    const mobileNumbers = pendingRows.map((p) => p.mobileNumber);

    const existing = await prisma.participant.findMany({
      where: {
        OR: [
          { email: { in: emails } },
          { mobileNumber: { in: mobileNumbers } },
        ],
      },
      select: { email: true, mobileNumber: true },
    });

    const existingEmails = new Set(existing.map((e) => e.email));
    const existingMobiles = new Set(existing.map((e) => e.mobileNumber));

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    const participantsToInsert: Participant[] = [];
    const emailPayload: { name: string; email: string; password: string }[] =
      [];

      
    for (const row of pendingRows) {
      const isValid =
        row.name &&
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.email) &&
        /^\d{10}$/.test(row.mobileNumber);

      if (!isValid) {
        await prisma.stagingParticipant.update({
          where: { id: row.id },
          data: { status: ParticipantStagingStatus.INVALID },
        });
        failed++;
        continue;
      }

      if (
        existingEmails.has(row.email) ||
        existingMobiles.has(row.mobileNumber)
      ) {
        await prisma.stagingParticipant.update({
          where: { id: row.id },
          data: { status: ParticipantStagingStatus.DUPLICATE },
        });
        skipped++;
        continue;
      }

      participantsToInsert.push({
        name: row.name,
        email: row.email,
        mobileNumber: row.mobileNumber,
        password: row.password,
        organizationId,
        createdById,
        approved: true,
      });

      emailPayload.push({
        name: row.name,
        email: row.email,
        password: row.password,
      });

      await prisma.stagingParticipant.update({
        where: { id: row.id },
        data: { status: ParticipantStagingStatus.IMPORTED },
      });

      inserted++;
    }

    // Final insert to main table
    if (participantsToInsert.length > 0) {
      await prisma.participant.createMany({ data: participantsToInsert });
    }

    // Send emails
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
      message: "Participants uploaded using staging and processed.",
      inserted,
      skipped,
      failed,
    });
  } catch (err) {
    console.error("Error in staging participant upload:", err);
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
