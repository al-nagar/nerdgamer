'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: { id: string; email: string; username?: string; name?: string; profileImage?: string | null };
  upvotes?: number;
  downvotes?: number;
  parentId?: string | null;
  replies?: Comment[];
  deleted?: boolean;
}

// Helper to check if a comment or any of its descendants is visible
function hasVisibleReplies(comment: Comment): boolean {
  if (!comment.replies || comment.replies.length === 0) return false;
  for (const reply of comment.replies) {
    if (!reply.deleted || hasVisibleReplies(reply)) {
      return true;
    }
  }
  return false;
}

// Add avatar logic for comment authors
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
}

function UserAvatar({ name, profileImage, size = 28 }: { name: string; profileImage?: string | null; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
      />
    );
  }
  const initials = name
    ? name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase()
    : "U";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: stringToColor(name || "user"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size / 2,
        fontWeight: "bold",
        border: "2px solid #fff"
      }}
    >
      {initials}
    </div>
  );
}

function CommentItem({ comment, user, onReply, onEdit, onDelete, onVote, replyingTo, editingId, setReplyingTo, setEditingId }: {
  comment: Comment;
  user: any;
  onReply: (id: string, content: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onVote: (id: string, type: 'upvote' | 'downvote') => void;
  replyingTo: string | null;
  editingId: string | null;
  setReplyingTo: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
}) {
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const isDeleted = comment.deleted;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const hasVisible = hasVisibleReplies(comment);

  // If deleted and has no visible replies, do not render
  if (isDeleted && !hasVisible) return null;

  return (
    <div className="border-b border-gray-700 py-4 pl-2">
      <div className="flex items-center gap-2 mb-1">
        {/* Avatar and display name */}
        {!isDeleted ? (
          <>
            {(() => {
              const displayName = comment.author.name && comment.author.name.trim() !== "" ? comment.author.name : comment.author.username;
              return (
                <>
                  <Link href={`/profile/${comment.author.username || comment.author.id}`} className="flex items-center gap-2 group">
                    <UserAvatar name={displayName} profileImage={comment.author.profileImage} size={28} />
                    <span className="font-semibold text-blue-300 group-hover:underline">{displayName}</span>
                  </Link>
                </>
              );
            })()}
          </>
        ) : (
          <span className="font-semibold text-gray-400 italic">Unknown user</span>
        )}
        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      {isDeleted ? (
        <p className="mb-2 text-gray-400 italic">This comment was deleted.</p>
      ) : editingId === comment.id ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await onEdit(comment.id, editContent);
            setLoading(false);
            setEditingId(null);
          }}
          className="mb-2"
        >
          <textarea
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={2}
            disabled={loading}
          />
          <div className="flex gap-2 mt-1">
            <button type="submit" className="px-3 py-1 bg-green-600 rounded text-white text-xs" disabled={loading}>Save</button>
            <button type="button" className="px-3 py-1 bg-gray-600 rounded text-white text-xs" onClick={() => setEditingId(null)} disabled={loading}>Cancel</button>
          </div>
        </form>
      ) : (
        <p className="mb-2 text-gray-200 whitespace-pre-line">{comment.content}</p>
      )}
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => user && onVote(comment.id, 'upvote')}
          className={`hover:text-green-400 transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!user}
          title={!user ? 'You must be logged in to vote' : 'Upvote'}
        >
          ▲ {comment.upvotes || 0}
        </button>
        <button
          onClick={() => user && onVote(comment.id, 'downvote')}
          className={`hover:text-red-400 transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!user}
          title={!user ? 'You must be logged in to vote' : 'Downvote'}
        >
          ▼ {comment.downvotes || 0}
        </button>
        {!isDeleted && user && (
          <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="hover:text-blue-400">Reply</button>
        )}
        {!isDeleted && user && user.id === comment.author.id && (
          <>
            <button onClick={() => setEditingId(editingId === comment.id ? null : comment.id)} className="hover:text-yellow-400">Edit</button>
            <button onClick={() => onDelete(comment.id)} className="hover:text-red-500">Delete</button>
          </>
        )}
      </div>
      {replyingTo === comment.id && user && !isDeleted && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await onReply(comment.id, replyContent);
            setReplyContent('');
            setReplyingTo(null);
            setLoading(false);
          }}
          className="mt-2"
        >
          <textarea
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            rows={2}
            disabled={loading}
            placeholder="Write a reply..."
          />
          <div className="flex gap-2 mt-1">
            <button type="submit" className="px-3 py-1 bg-blue-600 rounded text-white text-xs" disabled={loading}>Reply</button>
            <button type="button" className="px-3 py-1 bg-gray-600 rounded text-white text-xs" onClick={() => setReplyingTo(null)} disabled={loading}>Cancel</button>
          </div>
        </form>
      )}
      {/* Recursive rendering for all levels of replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 border-l-2 border-gray-700 pl-4 mt-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
              replyingTo={replyingTo}
              editingId={editingId}
              setReplyingTo={setReplyingTo}
              setEditingId={setEditingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function nestComments(comments: Comment[]): Comment[] {
  const map: Record<string, Comment & { replies: Comment[] }> = {};
  const roots: Comment[] = [];
  comments.forEach(c => {
    map[c.id] = { ...c, replies: [] };
  });
  Object.values(map).forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

// Helper to count visible comments recursively
function countVisibleComments(comments: Comment[]): number {
  let count = 0;
  for (const comment of comments) {
    const isDeleted = comment.deleted;
    const hasVisible = hasVisibleReplies(comment);
    if (!isDeleted || hasVisible) {
      count += 1;
    }
    if (comment.replies && comment.replies.length > 0) {
      count += countVisibleComments(comment.replies);
    }
  }
  return count;
}

export default function CommentsSection({ gameSlug, initialComments = [] }: { gameSlug: string; initialComments?: Comment[] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Helper to reload comments (could be improved for real-time)
  const reloadComments = async () => {
    const res = await fetch(`/api/comments?gameSlug=${encodeURIComponent(gameSlug)}`);
    const data = await res.json();
    setComments(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to comment.');
      return;
    }
    if (newComment.trim() === '') return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug, content: newComment }),
      });
      if (response.ok) {
        await reloadComments();
        setNewComment('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to post comment.');
      }
    } catch (err) {
      setError('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) return;
    await fetch(`/api/comments/${parentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', content }),
    });
    await reloadComments();
  };

  const handleEdit = async (id: string, content: string) => {
    if (!user) return;
    await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    await reloadComments();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    await reloadComments();
  };

  const handleVote = async (id: string, type: 'upvote' | 'downvote') => {
    if (!user) return;
    await fetch(`/api/comments/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: type }),
    });
    await reloadComments();
  };

  const nested = nestComments(comments);
  const visibleCount = countVisibleComments(nested);

  return (
    <div className="mt-10 bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Comments ({visibleCount})</h2>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>
      ) : (
        <p className="mb-6 p-4 bg-gray-800 rounded text-gray-300">
          You must be <a href="/login" className="text-blue-400 underline">logged in</a> to post a comment.
        </p>
      )}
      <div className="comments-list">
        {nested.length === 0 && <p className="text-gray-400">No comments yet. Be the first to comment!</p>}
        {nested.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            user={user}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onVote={handleVote}
            replyingTo={replyingTo}
            editingId={editingId}
            setReplyingTo={setReplyingTo}
            setEditingId={setEditingId}
          />
        ))}
      </div>
    </div>
  );
} 