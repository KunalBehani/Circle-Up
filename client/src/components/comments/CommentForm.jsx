import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';
import { Button } from '../common/Button.jsx';
import { Send } from 'lucide-react';

export const CommentForm = ({ postId, onCommentAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
      });

      if (res.data?.success) {
        success('Comment posted!');
        setContent('');
        if (onCommentAdded) onCommentAdded(res.data.comment);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center text-xs text-neutral-600">
        <span>Want to join the discussion? </span>
        <Link to="/login" className="font-bold text-brand-600 hover:underline">
          Log in
        </Link>
        <span> or </span>
        <Link to="/register" className="font-bold text-brand-600 hover:underline">
          Sign up
        </Link>
        <span> to add a comment.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
        <span>Comment as </span>
        <span className="font-bold text-neutral-800">u/{user?.username}</span>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your perspective, constructive feedback, or answer..."
          required
          maxLength={2000}
          className="w-full rounded-xl border border-neutral-300 p-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-neutral-400"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-neutral-400">
            {content.length}/2000 characters
          </span>

          <Button
            type="submit"
            size="sm"
            variant="primary"
            loading={loading}
            disabled={!content.trim() || loading}
            icon={Send}
          >
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
