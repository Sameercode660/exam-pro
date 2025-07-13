import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { participantIds, adminId } = await req.json();

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "participantIds must be a non-empty array." }, { status: 400 });
    }

    if (!adminId) {
      return NextResponse.json({ error: "adminId is required." }, { status: 400 });
    }

    // Fetch all participants
    const participants = await prisma.participant.findMany({
      where: {
        id: { in: participantIds },
        approved: false, // Only update unapproved participants
      },
    });

    if (participants.length === 0) {
      return NextResponse.json({ message: "No participants to approve." }, { status: 200 });
    }

    const idsToUpdate = participants.map((p) => p.id);

    // Phase 1: Update DB in bulk
    await prisma.participant.updateMany({
      where: {
        id: { in: idsToUpdate },
      },
      data: {
        approved: true,
        createdById: adminId,
      },
    });

    // Phase 2: Send emails after DB update
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    for (const participant of participants) {
      await transporter.sendMail({
        from: `"exam-pro-credential" <${process.env.SMTP_EMAIL}>`,
        to: participant.email,
        subject: "Your Exam Portal Account Approved",
        text: `Hello ${participant.name},\n\nYour account has been approved.\nYou can now login and participate in exams.\n\nRegards,\nExam Pro Team`,
      });
    }

    return NextResponse.json({
      message: `${participants.length} participants approved and emails sent.`,
    });

  } catch (err) {
    console.error("Error in bulk approve:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
