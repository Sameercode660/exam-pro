import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import prisma from "@/utils/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { StagingStatus, UploadType } from "@/generated/prisma";
import { formatDateTime } from "@/utils/format-date-time";

type RawRow = {
  name?: string;
  email?: string;
  mobileNumber?: string;
};

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const groupId = formData.get("groupId")
      ? Number(formData.get("groupId"))
      : undefined;
    const organizationId = Number(formData.get("organizationId"));
    const createdById = Number(formData.get("createdById"));

    const { searchParams } = req.nextUrl;
    // Keep naming parity with question upload API
    const adminId = Number(searchParams.get("adminId") || createdById);
    const fileName = searchParams.get("fileName") || (file instanceof File ? file.name : "Participants.xlsx");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "File not found or invalid" }, { status: 400 });
    }
    if (!organizationId || !adminId || !createdById) {
      return NextResponse.json({ error: "Missing organizationId/adminId/createdById" }, { status: 400 });
    }

    // 1) Create batch in UploadParticipantBatch
    const batch = await prisma.uploadParticipantBatch.create({
      data: {
        adminId,
        fileName,
        status: "PENDING",
      },
    });
    const batchId = batch.id;

    // 2) Parse Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json<RawRow>(workbook.Sheets[sheetName]);

    if (rawRows.length === 0) {
      await prisma.uploadParticipantBatch.update({
        where: { id: batchId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "No participants found in file." }, { status: 400 });
    }

    // 3) Stage rows
    const stagedToCreate = rawRows.map((row) => ({
      name: String(row?.name ?? "").trim(),
      email: String(row?.email ?? "").trim().toLowerCase(),
      mobileNumber: String(row?.mobileNumber ?? "").trim(),
      password: generateRandomPassword(),
      organizationId,
      createdById: adminId,
      status: StagingStatus.PENDING as StagingStatus,
      batchId,
    }));

    if (stagedToCreate.length > 0) {
      await prisma.stagingParticipant.createMany({ data: stagedToCreate });
    }

    // 4) Process PENDING
    const pendingRows = await prisma.stagingParticipant.findMany({
      where: { status: StagingStatus.PENDING, batchId },
      orderBy: { id: "asc" },
    });

    const emails = pendingRows.map((r) => r.email);
    const mobiles = pendingRows.map((r) => r.mobileNumber);

    // Existing participants in same org
    const existingParticipants = await prisma.participant.findMany({
      where: {
        organizationId,
        OR: [{ email: { in: emails } }, { mobileNumber: { in: mobiles } }],
      },
      select: { id: true, email: true, mobileNumber: true, name: true },
    });
    const existingByEmail = new Map(existingParticipants.map((p) => [p.email.toLowerCase(), p]));
    const existingByMobile = new Map(existingParticipants.map((p) => [p.mobileNumber, p]));

    // If group provided, figure out who is already in it
    const existingIds = existingParticipants.map((p) => p.id);
    const alreadyInGroupIds = new Set<number>();
    if (groupId) {
      const existingGp = await prisma.groupParticipant.findMany({
        where: { groupId, participantId: { in: existingIds } },
        select: { participantId: true },
      });
      for (const x of existingGp) alreadyInGroupIds.add(x.participantId);
    }

    // Counters
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    // For group adds (existing)
    const toGroupExisting: number[] = [];

    // For creations
    const createPayload: {
      name: string;
      email: string;
      mobileNumber: string;
      password: string;
      organizationId: number;
      createdById: number;
      approved: boolean;
      batchId: number;
    }[] = [];
    const createdEmailPayload: { email: string; name: string; password: string }[] = [];
    let createdParticipantIds: number[] = [];

    // Frontend-ready summary table
    // Reuse the "columns/rows/totals/meta" shape so your Excel downloader works identically.
    // Columns: Row No | Name | Email | Mobile | Status | Error / Action
    const summaryRows: Array<[number, string, string, string, string, string]> = [];

    const validateRow = (r: typeof pendingRows[number]) =>
      !!r.name &&
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(r.email) &&
      /^\d{10}$/.test(r.mobileNumber);

    for (let i = 0; i < pendingRows.length; i++) {
      const row = pendingRows[i];
      let errorMessage = "";
      let stagingStatus: StagingStatus = StagingStatus.IMPORTED;
      let actionNote = "";

      const isValid = validateRow(row);

      if (!isValid) {
        errorMessage = "Invalid format";
        stagingStatus = StagingStatus.INVALID;
        failed++;
        await prisma.stagingParticipant.update({
          where: { id: row.id },
          data: { status: stagingStatus, errorMessage },
        });
        summaryRows.push([i + 1, row.name ?? "", row.email ?? "", row.mobileNumber ?? "", String(stagingStatus), errorMessage]);
        continue;
      }

      const existing =
        existingByEmail.get(row.email.toLowerCase()) ||
        existingByMobile.get(row.mobileNumber);

      if (existing) {
        // Existing participant
        stagingStatus = StagingStatus.DUPLICATE;

        if (groupId) {
          // add to group if not already
          if (!alreadyInGroupIds.has(existing.id)) {
            toGroupExisting.push(existing.id);
            actionNote = "Existing user added to group";
          } else {
            actionNote = "Existing user already in group";
          }
        } else {
          actionNote = "Existing user";
        }

        skipped++;
        await prisma.stagingParticipant.update({
          where: { id: row.id },
          data: { status: stagingStatus, errorMessage: "Duplicate" },
        });

        summaryRows.push([
          i + 1,
          row.name || "",
          row.email || "",
          row.mobileNumber || "",
          String(stagingStatus),
          actionNote || "Duplicate",
        ]);
        continue;
      }

      // New participant -> schedule creation
      createPayload.push({
        name: row.name,
        email: row.email.toLowerCase(),
        mobileNumber: row.mobileNumber,
        password: row.password,
        organizationId,
        createdById: adminId,
        approved: true,
        batchId,
      });
      createdEmailPayload.push({
        email: row.email.toLowerCase(),
        name: row.name,
        password: row.password,
      });

      // We'll set staging to IMPORTED after DB create succeeds
    }

    // Perform DB mutations in a transaction
    await prisma.$transaction(async (tx) => {
      // Create new participants
      if (createPayload.length > 0) {
        await tx.participant.createMany({ data: createPayload });

        const created = await tx.participant.findMany({
          where: {
            organizationId,
            email: { in: createPayload.map((c) => c.email) },
          },
          select: { id: true, email: true },
        });
        createdParticipantIds = created.map((c) => c.id);

        // Mark their staging rows as IMPORTED
        await tx.stagingParticipant.updateMany({
          where: {
            batchId,
            email: { in: createPayload.map((c) => c.email) },
          },
          data: { status: StagingStatus.IMPORTED, errorMessage: null },
        });
      }

      // Add to group if requested: both newly created + existing to add
      if (groupId) {
        const groupInsertIds = [...createdParticipantIds, ...toGroupExisting];
        if (groupInsertIds.length > 0) {
          await tx.groupParticipant.createMany({
            data: groupInsertIds.map((participantId) => ({
              groupId,
              participantId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update batch status
      inserted = createdParticipantIds.length;
      const totalProcessed = pendingRows.length;
      const batchStatus =
        inserted > 0 && failed === 0
          ? "IMPORTED"
          : inserted > 0 && failed > 0
          ? "PARTIAL"
          : "FAILED";

      await tx.uploadParticipantBatch.update({
        where: { id: batchId },
        data: { status: batchStatus },
      });
    });

    // Fill summary rows for created users (after success)
    if (createPayload.length > 0) {
      // Map email -> row index to fill action lines consistently
      const emailToIndex = new Map<string, number>();
      pendingRows.forEach((r, idx) => {
        if (r.email) emailToIndex.set(r.email.toLowerCase(), idx);
      });

      for (const c of createPayload) {
        const idx = (emailToIndex.get(c.email) ?? -1) + 1; // 1-based
        summaryRows.push([
          idx > 0 ? idx : summaryRows.length + 1,
          c.name,
          c.email,
          c.mobileNumber,
          String(StagingStatus.IMPORTED),
          groupId ? "Created & added to group" : "Created",
        ]);
      }
    }

    // Email credentials (best-effort, outside txn)
    if (createdEmailPayload.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      for (const { email, name, password } of createdEmailPayload) {
        try {
          await transporter.sendMail({
            from: `"Exam Pro Credential" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your Exam Portal Account Credentials",
            text: `Hello ${name},

Your account has been created.

Email: ${email}
Password: ${password}

Please login and change your password after first login.

Regards,
Exam Pro Team`,
          });
        } catch (e) {
          console.error(`Email send failed for ${email}`, e);
          // Optionally: you could append a row noting email failure
        }
      }
    }

    // Get admin name for meta
    const admin = await prisma.user.findUnique({ where: { id: adminId } });

    // Final counts
    const batchFinalStatus =
      inserted > 0 && failed === 0
        ? "IMPORTED"
        : inserted > 0 && failed > 0
        ? "PARTIAL"
        : "FAILED";

    // Build frontend-ready summaryData (same shape as question upload)
    const summaryData = {
      columns: ["Row No", "Name", "Email", "Mobile", "Status", "Note"],
      rows: summaryRows
        .sort((a, b) => a[0] - b[0]) // sort by row no
        .map(([rowNo, name, email, mobile, status, note]) => [
          rowNo,
          name,
          email,
          mobile,
          String(status),
          note,
        ]),
      totals: {
        inserted,
        skipped,
        failed,
        total: inserted + skipped + failed,
      },
      meta: {
        adminName: admin?.name ?? "Admin",
        fileName,
        batchId,
        processedAt: formatDateTime(new Date()),
        batchStatus: batchFinalStatus,
        ...(groupId ? { groupId } : {}),
      },
    };

    // Persist FileUploadSummary
    await prisma.fileUploadSummary.create({
      data: {
        batchId,
        adminId,
        type: groupId ? UploadType.PARTICIPANT_GROUP_ADD : UploadType.PARTICIPANT_FILE,
        fileName,
        inserted,
        skipped,
        failed,
        summaryData,
      },
    });

    // Response
    return NextResponse.json({
      message: "Participants uploaded using staging and processed.",
      batchId,
      inserted,
      skipped,
      failed,
      batchStatus: batchFinalStatus,
      summaryData,
    });
  } catch (error) {
    console.error("Participant upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateRandomPassword() {
  const min = 10000000;
  const max = 99999999;
  const randomBytes = crypto.randomBytes(4).readUInt32BE(0);
  return (min + (randomBytes % (max - min + 1))).toString();
}
