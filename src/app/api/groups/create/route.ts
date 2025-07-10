import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      startDate,
      endDate,
      createdById,
      organizationId,
    } = body;
    
    console.log(name, description, startDate, createdById, endDate, organizationId)
    // Validate required fields
    if (!name || !startDate || !endDate || !createdById || !organizationId) {
      return NextResponse.json({
        error: 'Missing required fields: name, startDate, endDate, createdById, or organizationId.'
      }, { status: 400 });
    }

    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid startDate or endDate format.' }, { status: 400 });
    }
    if (start > end) {
      return NextResponse.json({ error: 'startDate must be before endDate.' }, { status: 400 });
    }

    // Check if createdById exists
    const creator = await prisma.user.findUnique({ where: { id: createdById } });
    if (!creator) {
      return NextResponse.json({ error: 'CreatedBy user not found.' }, { status: 404 });
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById,
        organizationId,
      }
    });

    return NextResponse.json({ message: 'Group created successfully', group: newGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}