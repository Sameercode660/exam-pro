import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { groupId, adminId } = await req.json();

    // Validation
    if (!groupId || typeof groupId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
    }

    if (!adminId || typeof adminId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing adminId' }, { status: 400 });
    }

    // Check if group exists and is created by the same admin
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.createdById !== adminId) {
      return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
    }

    // Update visibility to false
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { visibility: false },
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
