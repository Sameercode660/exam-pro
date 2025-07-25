 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const { groupId, participantId } = await req.json();

    if (!groupId || !participantId) {
      return NextResponse.json(
        { error: 'Group ID and Participant ID are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.groupParticipant.update({
      where: {
        groupId_participantId: {
          groupId: Number(groupId),
          participantId: Number(participantId),
        },
      },
      data: {
        visibility: false,
      },
    });

    return NextResponse.json({ message: 'Participant visibility set to false', updated });
  } catch (err) {
    console.error('Error soft-deleting participant:', err);
    return NextResponse.json(
      { error: 'Failed to update participant visibility' },
      { status: 500 }
    );
  }
}
