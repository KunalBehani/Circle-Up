import React from 'react';
import { Link } from 'react-router-dom';
import { PostCard } from './PostCard.jsx';
import { PostSkeleton } from '../common/Loader.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Flame,
  Clock,
  TrendingUp,
  MessageSquareDashed,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const PostFeed = ({
  posts,
  loading,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  onPostDeleted,
  onPostUpdated,
  communitySlug,
}) => {
  const { isAuthenticated, user } = useAuth();

  const sortButtons = [
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'trending', label: 'Trending', icon: Flame },
  ];

  return (
    <div className="space-y-4">
      {/* Feed Controls Header */}
      <div className="editorial-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
          {sortButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = sort === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onSortChange(btn.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-subtle'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive && btn.id === 'trending' ? 'text-accent-amber' : ''}`} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Post Prompt */}
        <Link
          to={communitySlug ? `/submit?community=${communitySlug}` : '/submit'}
          className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-600 border border-neutral-200/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-brand-600" />
            <span>Create a Discussion</span>
          </span>
        </Link>
      </div>

      {/* Post List */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3.5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={onPostDeleted}
              onPostUpdated={onPostUpdated}
            />
          ))}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="editorial-card p-4 flex items-center justify-between text-xs font-semibold text-neutral-600 mt-6">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total posts)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
            <MessageSquareDashed className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-neutral-800">No discussions found</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Be the first to ignite a conversation in this circle! Share your ideas, links, or inquiries.
          </p>
          <Link
            to={communitySlug ? `/submit?community=${communitySlug}` : '/submit'}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Post</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
