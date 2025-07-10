import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const {
      groupId,
      adminId,
      name,
      description,
      startDate,
      endDate,
      isActive,
    } = await req.json();

    // Validation
    if (!groupId || typeof groupId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing groupId' }, { status: 400 });
    }

    if (!adminId || typeof adminId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing adminId' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.createdById !== adminId) {
      return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 });
    }

    // Build update payload
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Group updated successfully',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
