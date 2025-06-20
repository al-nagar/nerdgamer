import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.gameCache.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: {
        slug: true,
        gameData: true,
        views: true,
      },
    });
    // Extract name and background_image from gameData
    const result = games.map(g => ({
      slug: g.slug,
      name: g.gameData.name,
      background_image: g.gameData.background_image,
      views: g.views,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch popular games.' }, { status: 500 });
  }
} 