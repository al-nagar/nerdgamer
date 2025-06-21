import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getUserFromRequest(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, email: true, username: true } },
      replies: {
        orderBy: { createdAt: 'asc' }
      },
    },
  });
  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  return NextResponse.json(comment);
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (comment.authorId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { content } = await request.json();
  const updated = await prisma.comment.update({ where: { id }, data: { content } });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (comment.authorId !== user.userId && !user.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Soft delete: mark as deleted and replace content
  await prisma.comment.update({
    where: { id },
    data: {
      deleted: true,
      content: 'This comment was deleted.'
    }
  });

  // Helper to check recursively if a comment has any non-deleted descendants
  async function hasNonDeletedDescendants(commentId: string): Promise<boolean> {
    const children = await prisma.comment.findMany({ where: { parentId: commentId } });
    for (const child of children) {
      if (!child.deleted) return true;
      if (await hasNonDeletedDescendants(child.id)) return true;
    }
    return false;
  }

  async function tryHardDeleteSelfOrParent(commentId: string | null) {
    if (!commentId) return;
    const current = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!current) return;
    // Only hard-delete if there are no non-deleted descendants
    if (current.deleted && !(await hasNonDeletedDescendants(commentId))) {
      // Recursively hard-delete all soft-deleted descendants
      async function hardDeleteSoftDeletedDescendants(parentId: string) {
        const children = await prisma.comment.findMany({ where: { parentId } });
        for (const child of children) {
          if (child.deleted) {
            await hardDeleteSoftDeletedDescendants(child.id);
            await prisma.commentVote.deleteMany({ where: { commentId: child.id } });
            await prisma.comment.delete({ where: { id: child.id } });
          }
        }
      }
      await hardDeleteSoftDeletedDescendants(commentId);
      // Delete all votes for this comment
      await prisma.commentVote.deleteMany({ where: { commentId } });
      // Hard delete the comment
      await prisma.comment.delete({ where: { id: commentId } });
      // Recursively check up the thread
      await tryHardDeleteSelfOrParent(current.parentId);
    }
  }

  await tryHardDeleteSelfOrParent(id);

  return NextResponse.json({ success: true });
}

// POST for upvote/downvote/reply
export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, content } = await request.json();
  if (action === 'upvote' || action === 'downvote') {
    // Check for existing vote
    const existingVote = await prisma.commentVote.findUnique({
      where: { userId_commentId: { userId: user.userId, commentId: id } },
    });
    if (!existingVote) {
      // Create new vote
      await prisma.commentVote.create({
        data: {
          userId: user.userId,
          commentId: id,
          type: action,
        },
      });
    } else if (existingVote.type === action) {
      // Toggle off (remove vote)
      await prisma.commentVote.delete({ where: { userId_commentId: { userId: user.userId, commentId: id } } });
    } else {
      // Change vote type
      await prisma.commentVote.update({
        where: { userId_commentId: { userId: user.userId, commentId: id } },
        data: { type: action },
      });
    }
    // Recalculate upvotes/downvotes
    const upvotes = await prisma.commentVote.count({ where: { commentId: id, type: 'upvote' } });
    const downvotes = await prisma.commentVote.count({ where: { commentId: id, type: 'downvote' } });
    await prisma.comment.update({ where: { id }, data: { upvotes, downvotes } });
    const updated = await prisma.comment.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } else if (action === 'reply') {
    // Create a reply
    const parent = await prisma.comment.findUnique({ where: { id } });
    if (!parent) return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    if (!content || content.trim() === '') return NextResponse.json({ error: 'Content required' }, { status: 400 });
    const reply = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.userId,
        gameSlug: parent.gameSlug,
        parentId: id,
      },
      include: {
        author: { select: { id: true, email: true, username: true } },
      },
    });
    // Auto-upvote for reply author
    await prisma.commentVote.create({
      data: {
        userId: user.userId,
        commentId: reply.id,
        type: 'upvote',
      },
    });
    // Recalculate upvotes for the reply
    const upvotes = await prisma.commentVote.count({ where: { commentId: reply.id, type: 'upvote' } });
    await prisma.comment.update({ where: { id: reply.id }, data: { upvotes } });
    // Return the reply with upvotes
    const replyWithVotes = await prisma.comment.findUnique({
      where: { id: reply.id },
      include: { author: { select: { id: true, email: true, username: true } } },
    });
    return NextResponse.json(replyWithVotes, { status: 201 });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 