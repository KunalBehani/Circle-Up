import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';
import { formatRelativeTime } from '../../utils/formatters.js';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

export const CommentItem = ({ comment, onCommentDeleted, onCommentUpdated }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user && comment.author && (comment.author._id === user._id || comment.author.id === user._id || comment.author.username === user.username);

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.patch(`/comments/${comment._id}`, {
        content: content.trim(),
      });
      if (res.data?.success) {
        success('Comment updated');
        setIsEditing(false);
        if (onCommentUpdated) onCommentUpdated(res.data.comment);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/comments/${comment._id}`);
      if (res.data?.success) {
        success('Comment deleted');
        setDeleteModalOpen(false);
        if (onCommentDeleted) onCommentDeleted(comment._id);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-3.5 border-b border-neutral-100 last:border-b-0 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <img
            src={comment.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username}`}
            alt={comment.author?.username}
            className="w-5 h-5 rounded-full bg-brand-50 object-cover"
          />
          <Link
            to={`/profile/${comment.author?.username}`}
            className="font-bold text-neutral-800 hover:text-brand-600 transition-colors"
          >
            u/{comment.author?.username}
          </Link>
          <span>•</span>
          <span>{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {isAuthor && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Edit comment"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Body / Inline Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-2 mt-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            maxLength={2000}
            required
            className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setContent(comment.content);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={isSaving}
            >
              Save
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-xs sm:text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed pl-7">
          {comment.content}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Comment?"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete this comment? This action cannot be reversed.
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
              Delete Comment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommentItem;
