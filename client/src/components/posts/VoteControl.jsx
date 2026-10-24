import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';
import { formatNumber } from '../../utils/formatters.js';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

export const VoteControl = ({ postId, initialScore = 0, initialUserVote = null, onVoteUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  // Sync if initial props change
  React.useEffect(() => {
    setScore(initialScore);
    setUserVote(initialUserVote);
  }, [initialScore, initialUserVote]);

  const handleVote = async (value) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    // Optimistic calculation
    const prevScore = score;
    const prevVote = userVote;

    let optimisticScore = score;
    let optimisticVote = null;

    if (userVote === null) {
      optimisticVote = value;
      optimisticScore = score + value;
    } else if (userVote === value) {
      optimisticVote = null;
      optimisticScore = score - value;
    } else {
      optimisticVote = value;
      optimisticScore = score + 2 * value;
    }

    setScore(optimisticScore);
    setUserVote(optimisticVote);
    setLoading(true);

    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      if (res.data?.success) {
        setScore(res.data.score);
        setUserVote(res.data.userVote);
        if (onVoteUpdate) onVoteUpdate(res.data.score, res.data.userVote);
      }
    } catch (err) {
      // Revert optimistic update
      setScore(prevScore);
      setUserVote(prevVote);
      toastError(err.response?.data?.message || 'Vote failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-neutral-50/80 rounded-xl p-1 shrink-0 border border-neutral-200/50">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-1 rounded-lg transition-colors ${
          userVote === 1
            ? 'text-brand-600 bg-brand-100/70 hover:bg-brand-100'
            : 'text-neutral-400 hover:text-brand-600 hover:bg-neutral-200/60'
        }`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={`w-6 h-6 ${userVote === 1 ? 'fill-current' : ''}`} />
      </button>

      <span
        className={`text-xs font-bold my-0.5 tracking-tight ${
          userVote === 1
            ? 'text-brand-600'
            : userVote === -1
            ? 'text-rose-600'
            : 'text-neutral-700'
        }`}
      >
        {formatNumber(score)}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-1 rounded-lg transition-colors ${
          userVote === -1
            ? 'text-rose-600 bg-rose-100/70 hover:bg-rose-100'
            : 'text-neutral-400 hover:text-rose-600 hover:bg-neutral-200/60'
        }`}
        aria-label="Downvote"
      >
        <ArrowBigDown className={`w-6 h-6 ${userVote === -1 ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

export default VoteControl;
