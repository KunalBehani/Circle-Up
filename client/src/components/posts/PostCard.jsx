import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';
import { VoteControl } from './VoteControl.jsx';
import { formatRelativeTime, extractDomain } from '../../utils/formatters.js';
import {
  MessageSquare,
  ExternalLink,
  Share2,
  Trash2,
  Edit3,
  MoreHorizontal,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';

export const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body || '');
  const [editLink, setEditLink] = useState(post.linkUrl || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isAuthor = user && post.author && (post.author._id === user._id || post.author.id === user._id || post.author.username === user.username);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    success('Post link copied to clipboard!');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data?.success) {
        success('Post deleted successfully');
        setDeleteModalOpen(false);
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const res = await api.patch(`/posts/${post._id}`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        linkUrl: post.type === 'link' ? editLink.trim() : undefined,
      });

      if (res.data?.success) {
        success('Post updated!');
        setEditModalOpen(false);
        if (onPostUpdated) onPostUpdated(res.data.post);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <article className="editorial-card p-4 sm:p-5 flex gap-3.5 sm:gap-4 hover:border-neutral-300 transition-colors">
      {/* Left Column: Vote Control */}
      <VoteControl
        postId={post._id}
        initialScore={post.score}
        initialUserVote={post.userVote}
      />

      {/* Right Column: Main Content */}
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
            <span className="flex items-center gap-1">
              Posted by{' '}
              <Link
                to={`/profile/${post.author?.username}`}
                className="hover:underline text-neutral-700 font-medium"
              >
                u/{post.author?.username || 'anonymous'}
              </Link>
            </span>
            <span>•</span>
            <span title={new Date(post.createdAt).toLocaleString()}>
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Author Actions */}
          {isAuthor && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                title="Edit post"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 hover:text-brand-600 transition-colors leading-snug mb-2">
          <Link to={`/post/${post._id}`}>{post.title}</Link>
        </h2>

        {/* Post Body Preview or Link Badge */}
        {post.type === 'link' && post.linkUrl && (
          <div className="mb-3">
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors border border-brand-200/60 max-w-full truncate"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{extractDomain(post.linkUrl)}</span>
            </a>
          </div>
        )}

        {post.body && (
          <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-3">
            {post.body}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-neutral-500">
          <Link
            to={`/post/${post._id}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount || 0} Comments</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Post?"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete <span className="font-semibold text-neutral-900">"{post.title}"</span>? This action is permanent and cannot be undone.
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
              Delete Post
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Post"
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
              Body
            </label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
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
    </article>
  );
};

export default PostCard;
