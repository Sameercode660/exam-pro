import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

type RequestTypes = {
  search: string;
}

export async function POST(req: NextRequest) {
  try {
    const { search }: Partial<RequestTypes> = await req.json();

    const searchWords: string[] = search
      ? search.split(' ').filter(Boolean)
      : [];

    // Construct OR condition manually to avoid type conflict
    const orConditions: any[] = [];

    for (const word of searchWords) {
      orConditions.push(
        { name: { contains: word, mode: 'insensitive' } },
        { email: { contains: word, mode: 'insensitive' } },
        { mobileNumber: { contains: word, mode: 'insensitive' } }
      );
    }

    const admins = await prisma.user.findMany({
      where: {
        role: 'Admin',
        ...(orConditions.length > 0 && { OR: orConditions }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
