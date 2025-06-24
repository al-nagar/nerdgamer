import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  let { id } = await context.params;
  // Try to find user by id or username
  let user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { username: id } });
  }
  if (!user) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const userGames = await prisma.userGameList.findMany({
      where: { userId: user.id },
      include: {
        game: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    const result = userGames.map(entry => ({
      slug: entry.gameSlug,
      name: entry.game.gameData?.name || entry.gameSlug,
      background_image: entry.game.gameData?.background_image || null,
      status: entry.status,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user game list.' }, { status: 500 });
  }
} 