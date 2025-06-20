import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.gameCache.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        slug: true,
        gameData: true,
        createdAt: true,
      },
    });
    const result = games.map(g => ({
      slug: g.slug,
      name: g.gameData.name,
      background_image: g.gameData.background_image,
      createdAt: g.createdAt,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recent games.' }, { status: 500 });
  }
} 