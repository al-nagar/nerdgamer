import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameSlug = searchParams.get('gameSlug');
  if (!gameSlug) {
    return NextResponse.json({ error: 'Missing gameSlug' }, { status: 400 });
  }
  const comments = await prisma.comment.findMany({
    where: { gameSlug },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, email: true, username: true } },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  // 1. Authenticate the user from the cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  // 2. Get the comment data from the request body
  const { gameSlug, content, parentId } = await request.json();

  if (!gameSlug || !content || content.trim() === '') {
    return NextResponse.json({ error: 'Invalid input: gameSlug and content are required.' }, { status: 400 });
  }

  // 3. Create the comment in the database
  try {
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: decoded.userId,
        gameSlug: gameSlug,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, email: true, username: true },
        },
      },
    });

    // Auto-upvote by author: create CommentVote
    await prisma.commentVote.create({
      data: {
        userId: decoded.userId,
        commentId: newComment.id,
        type: 'upvote',
      },
    });
    // Recalculate upvotes
    const upvotes = await prisma.commentVote.count({ where: { commentId: newComment.id, type: 'upvote' } });
    await prisma.comment.update({ where: { id: newComment.id }, data: { upvotes } });

    // Return the comment with upvotes
    const commentWithVotes = await prisma.comment.findUnique({
      where: { id: newComment.id },
      include: { author: { select: { id: true, email: true, username: true } } },
    });

    return NextResponse.json({
      ...commentWithVotes,
      upvotes: commentWithVotes?.upvotes,
      downvotes: commentWithVotes?.downvotes,
      parentId: commentWithVotes?.parentId,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json({ error: 'Failed to create comment.' }, { status: 500 });
  }
} 