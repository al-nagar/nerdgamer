import { NextResponse } from 'next/server';
import { getUnifiedGameData } from '@/lib/api';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    const data = await getUnifiedGameData(slug);
    if (!data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game data.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { slug } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { type } = await request.json();
  if (type !== 'upvote' && type !== 'downvote') {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  try {
    // Check if game exists
    const game = await prisma.gameCache.findUnique({ where: { slug } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check for existing vote
    const existingVote = await prisma.gameVote.findUnique({
      where: { userId_gameSlug: { userId: user.userId, gameSlug: slug } },
    });

    let upvotes = game.upvotes;
    let downvotes = game.downvotes;

    if (!existingVote) {
      // New vote
      await prisma.gameVote.create({
        data: {
          userId: user.userId,
          gameSlug: slug,
          type,
        },
      });
      if (type === 'upvote') upvotes++;
      else downvotes++;
    } else if (existingVote.type !== type) {
      // Change vote
      await prisma.gameVote.update({
        where: { userId_gameSlug: { userId: user.userId, gameSlug: slug } },
        data: { type },
      });
      if (type === 'upvote') {
        upvotes++;
        downvotes--;
      } else {
        downvotes++;
        upvotes--;
      }
    } else {
      // Remove vote (toggle off)
      await prisma.gameVote.delete({
        where: { userId_gameSlug: { userId: user.userId, gameSlug: slug } },
      });
      if (type === 'upvote') upvotes--;
      else downvotes--;
    }

    // Update game counts
    await prisma.gameCache.update({
      where: { slug },
      data: { upvotes, downvotes },
    });

    return NextResponse.json({ upvotes, downvotes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process vote.' }, { status: 500 });
  }
} 