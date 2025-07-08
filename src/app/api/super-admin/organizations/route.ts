import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const { search } = await req.json();

    const searchWords: string[] = search
      ? search.split(' ').filter(Boolean)
      : [];

    const organizations = await prisma.organization.findMany({
      where: searchWords.length
        ? {
            OR: searchWords.map(word => ({
              OR: [
                { name: { contains: word, mode: 'insensitive' } },
                { email: { contains: word, mode: 'insensitive' } },
                { phone: { contains: word, mode: 'insensitive' } },
                { address: { contains: word, mode: 'insensitive' } },
                { State: { contains: word, mode: 'insensitive' } },
                { Country: { contains: word, mode: 'insensitive' } },
              ],
            })),
          }
        : undefined, // fetch all
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
