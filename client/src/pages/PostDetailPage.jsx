import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { VoteControl } from '../components/posts/VoteControl.jsx';
import { CommentList } from '../components/comments/CommentList.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { formatRelativeTime, extractDomain } from '../utils/formatters.js';
import {
  ExternalLink,
  Share2,
  Trash2,
  Edit3,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Delete states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editLink, setEditLink] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch post and comments
  const fetchPostAndComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`),
      ]);

      if (postRes.data?.success) {
        setPost(postRes.data.post);
        setEditTitle(postRes.data.post.title);
        setEditBody(postRes.data.post.body || '');
        setEditLink(postRes.data.post.linkUrl || '');
      }
      if (commentsRes.data?.success) {
        setComments(commentsRes.data.comments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Discussion post could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const isAuthor =
    user && post?.author && (post.author._id === user._id || post.author.id === user._id || post.author.username === user.username);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Post link copied to clipboard!');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const res = await api.patch(`/posts/${postId}`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        linkUrl: post.type === 'link' ? editLink.trim() : undefined,
      });

      if (res.data?.success) {
        success('Post updated!');
        setPost((prev) => ({
          ...prev,
          title: res.data.post.title,
          body: res.data.post.body,
          linkUrl: res.data.post.linkUrl,
        }));
        setEditModalOpen(false);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data?.success) {
        success('Post deleted successfully');
        navigate(post.community ? `/c/${post.community.slug}` : '/');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
    setPost((prev) => ({
      ...prev,
      commentCount: (prev.commentCount || 0) + 1,
    }));
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setPost((prev) => ({
      ...prev,
      commentCount: Math.max(0, (prev.commentCount || 1) - 1),
    }));
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
    );
  };

  if (loading) {
    return <Loader message="Loading discussion..." />;
  }

  if (error || !post) {
    return (
      <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Post Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          {error || 'This discussion does not exist or may have been deleted by its author.'}
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
        >
          Return to Community Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Post Card */}
      <article className="editorial-card p-5 sm:p-6 flex gap-4 sm:gap-5">
        <VoteControl
          postId={post._id}
          initialScore={post.score}
          initialUserVote={post.userVote}
        />

        <div className="flex-1 min-w-0">
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {post.community && (
                <Link
                  to={`/c/${post.community.slug}`}
                  className="font-bold text-neutral-900 hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <span
                    className="w-4 h-4 rounded text-[9px] text-white flex items-center justify-center font-bold"
                    style={{ backgroundColor: post.community.bannerColor || '#4F46E5' }}
                  >
                    c/
                  </span>
                  <span>c/{post.community.slug}</span>
                </Link>
              )}
              <span>•</span>
              <span>
                Posted by{' '}
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="hover:underline text-neutral-700 font-medium"
                >
                  u/{post.author?.username}
                </Link>
              </span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>

            {/* Author Actions */}
            {isAuthor && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  title="Edit post"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-3">
            {post.title}
          </h1>

          {/* Link destination preview */}
          {post.type === 'link' && post.linkUrl && (
            <div className="mb-4">
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors border border-brand-200/60"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit {extractDomain(post.linkUrl)}</span>
              </a>
            </div>
          )}

          {/* Post Body */}
          {post.body && (
            <div className="text-sm sm:text-base text-neutral-800 leading-relaxed whitespace-pre-wrap mb-4">
              {post.body}
            </div>
          )}

          {/* Post Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center gap-3 text-xs font-semibold text-neutral-500">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Discussion</span>
            </button>
          </div>
        </div>
      </article>

      {/* Discussion & Comments */}
      <CommentList
        postId={post._id}
        comments={comments}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
        onCommentUpdated={handleCommentUpdated}
      />

      {/* Edit Post Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Discussion"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            maxLength={300}
          />

          {post.type === 'link' && (
            <Input
              label="URL"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              required
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Content
            </label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={5}
              maxLength={10000}
              className="w-full rounded-xl border border-neutral-300 p-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
              disabled={isSavingEdit}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={isSavingEdit}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Post Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Discussion?"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete this discussion and its associated replies?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostDetailPage;
