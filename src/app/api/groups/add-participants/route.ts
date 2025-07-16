import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const { groupId, participantIds } = await req.json();

    // existing participant IDs in the group
    const existingGroupParticipants = await prisma.groupParticipant.findMany({
      where: {
        groupId,
        participantId: { in: participantIds },
      },
      select: { participantId: true },
    });

    const existingIds = existingGroupParticipants.map(p => p.participantId);

    //  out participants who are already in the group
    const newParticipants = participantIds.filter((id: number) => !existingIds.includes(id));

    //  insert for better performance
    if (newParticipants.length > 0) {
      await prisma.groupParticipant.createMany({
        data: newParticipants.map((id: number) => ({
          groupId,
          participantId: id,
        })),
        skipDuplicates: true, // Additional safety (optional, since filtering is done)
      });
    }

    return NextResponse.json({
      message: 'Participants added to group',
      addedCount: newParticipants.length,
      skippedCount: existingIds.length,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
