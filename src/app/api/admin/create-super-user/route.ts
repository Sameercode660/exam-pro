import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, mobileNumber, password, createdById, organizationId } = await req.json();

    if (!name || !email || !mobileNumber || !password || !createdById || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        mobileNumber,
        password,
        role: 'SuperUser',
        organizationId,
        createdById,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    if(error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Error creating superuser:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
