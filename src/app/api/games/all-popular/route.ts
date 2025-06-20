import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '30', 10);
    const games = await prisma.gameCache.findMany({
      orderBy: { views: 'desc' },
      skip,
      take,
      select: {
        slug: true,
        gameData: true,
        views: true,
      },
    });
    const total = await prisma.gameCache.count();
    const result = games.map(g => ({
      slug: g.slug,
      name: g.gameData.name,
      background_image: g.gameData.background_image,
      views: g.views,
    }));
    return NextResponse.json({ games: result, hasMore: skip + take < total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch all popular games.' }, { status: 500 });
  }
} 