import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const groupId = Number(formData.get("groupId"));
    const organizationId = Number(formData.get("organizationId"));

    if (!file || !groupId || !organizationId) {
      return NextResponse.json({ error: "file, groupId, and organizationId are required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<any>(sheet);

    const emails = data.map((row) => row.email.toLowerCase());

    // Fetch participants in the same organization
    const participants = await prisma.participant.findMany({
      where: {
        organizationId,
        email: { in: emails },
      },
      select: { id: true, email: true, name: true },
    });

    const matchedEmails = participants.map((p) => p.email.toLowerCase());
    const unmatchedEmails = emails.filter(email => !matchedEmails.includes(email));

    const participantIds = participants.map(p => p.id);

    // Find existing group participants
    const existingGroupParticipants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        participantId: { in: participantIds },
      },
      select: { participantId: true },
    });

    const existingIds = existingGroupParticipants.map(p => p.participantId);

    // Prepare lists for response
    const alreadyInGroup = participants.filter(p => existingIds.includes(p.id));
    const toAdd = participants.filter(p => !existingIds.includes(p.id));

    // Bulk insert new participants
    if (toAdd.length > 0) {
      await prisma.groupParticipant.createMany({
        data: toAdd.map(p => ({
          groupId,
          participantId: p.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: "File processed.",
      addedNames: toAdd.map(p => p.name),
      alreadyInGroupNames: alreadyInGroup.map(p => p.name),
      unmatchedEmails,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
