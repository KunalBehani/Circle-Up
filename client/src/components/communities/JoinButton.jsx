import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';
import { Check, Plus, Loader2 } from 'lucide-react';

export const JoinButton = ({
  communityId,
  initialIsMember = false,
  onToggle,
  size = 'md',
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [isMember, setIsMember] = useState(initialIsMember);
  const [loading, setLoading] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setIsMember(initialIsMember);
  }, [initialIsMember]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    const previousState = isMember;

    try {
      if (isMember) {
        const res = await api.delete(`/communities/${communityId}/join`);
        if (res.data?.success) {
          setIsMember(false);
          success(res.data.message || 'Left community');
          if (onToggle) onToggle(false, res.data.memberCount);
          window.dispatchEvent(new CustomEvent('circleup:membership_changed'));
        }
      } else {
        const res = await api.post(`/communities/${communityId}/join`);
        if (res.data?.success) {
          setIsMember(true);
          success(res.data.message || 'Joined community!');
          if (onToggle) onToggle(true, res.data.memberCount);
          window.dispatchEvent(new CustomEvent('circleup:membership_changed'));
        }
      }
    } catch (err) {
      setIsMember(previousState);
      const msg = err.response?.data?.message || 'Action failed';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 h-7 rounded-lg',
    md: 'text-xs px-3.5 py-1.5 h-8 rounded-xl font-semibold',
    lg: 'text-sm px-5 py-2 h-10 rounded-xl font-semibold',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-1.5 transition-all select-none ${
        sizes[size] || sizes.md
      } ${
        isMember
          ? 'bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 border border-neutral-200 hover:border-rose-200'
          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isMember ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Joined</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Join</span>
        </>
      )}
    </button>
  );
};

export default JoinButton;
