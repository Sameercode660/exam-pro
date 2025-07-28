import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { groupId, requesterId } = await req.json();

    // Validate input
    if (!groupId || typeof groupId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
    }

    if (!requesterId || typeof requesterId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing requesterId' }, { status: 400 });
    }

    // Fetch group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Fetch requester details
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      return NextResponse.json({ error: 'Requester user not found' }, { status: 404 });
    }

    // Only allow if requester is SuperAdmin OR creator of the group
    const isAdmin = requester.role === 'SuperAdmin' || requester.role === 'Admin';
    const isCreator = group.createdById === requester.id;

    if (!(isAdmin || isCreator)) {
      return NextResponse.json({ error: 'Unauthorized to delete this group' }, { status: 403 });
    }

    // Perform soft delete (visibility = false)
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { visibility: false, updatedById: requesterId },
    });

    return NextResponse.json({
      message: 'Group soft-deleted successfully',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
