import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';


type RequestTypes = {
  query: string;
}
export async function POST(request: Request) {
  try {
    const body: Partial<RequestTypes> = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ message: 'Query parameter is required.' }, { status: 400 });
    }

    const words = query.split(' ');

    const results = await prisma.exam.findMany({
      where: {
        OR: words.map((word) => ({
          OR: [
            { title: { contains: word, mode: 'insensitive' } },
            { description: { contains: word, mode: 'insensitive' } },
          ],
        })),
        visibility: true
      },
      include: {
        createdBy: true,
        updatedBy: true
      }
    });

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
