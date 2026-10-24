import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { PostFeed } from '../components/posts/PostFeed.jsx';
import { JoinButton } from '../components/communities/JoinButton.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Users, Calendar, Plus, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters.js';

export const CommunityDetailPage = () => {
  const { communityName } = useParams();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('latest');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Fetch community details
  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/communities/${communityName}`);
      if (res.data?.success) {
        setCommunity(res.data.community);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Community 'c/${communityName}' not found`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scoped posts for this community
  const fetchPosts = async (sortOption = sort, page = 1) => {
    setPostsLoading(true);
    try {
      const res = await api.get(`/posts?community=${communityName}&sort=${sortOption}&page=${page}&limit=15`);
      if (res.data?.success) {
        setPosts(res.data.posts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [communityName]);

  useEffect(() => {
    if (community) {
      fetchPosts(sort, pagination.page);
    }
  }, [community, sort, pagination.page]);

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    );
  };

  if (loading) {
    return <Loader message="Loading circle..." />;
  }

  if (error || !community) {
    return (
      <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Community Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          {error || `The community c/${communityName} does not exist or has been removed.`}
        </p>
        <Link
          to="/explore"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
        >
          Explore All Circles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Banner & Header Surface */}
      <div className="editorial-card overflow-hidden">
        {/* Banner Color Bar */}
        <div
          className="h-24 sm:h-28 w-full transition-colors"
          style={{ backgroundColor: community.bannerColor || '#4F46E5' }}
        />

        <div className="p-5 sm:p-6 -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5">
              <span
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl text-white font-black shadow-elevation ring-4 ring-white shrink-0"
                style={{ backgroundColor: community.bannerColor || '#4F46E5' }}
              >
                c/
              </span>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                    {community.name}
                  </h1>
                  <Badge variant="brand">{community.category || 'General'}</Badge>
                </div>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  c/{community.slug}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to={`/submit?community=${community.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4 text-brand-600" />
                <span>Create Post</span>
              </Link>

              <JoinButton
                communityId={community._id}
                initialIsMember={community.isMember}
                size="md"
                onToggle={(newMemberState, newCount) => {
                  setCommunity((prev) => ({
                    ...prev,
                    isMember: newMemberState,
                    memberCount: newCount,
                  }));
                }}
              />
            </div>
          </div>

          {/* Description & Metadata */}
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl">
              {community.description}
            </p>

            <div className="flex items-center gap-5 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neutral-400" />
                <strong className="text-neutral-800 font-bold">{community.memberCount}</strong>{' '}
                {community.memberCount === 1 ? 'member' : 'members'}
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neutral-400" />
                Created {formatRelativeTime(community.createdAt)} by{' '}
                <Link
                  to={`/profile/${community.creator?.username}`}
                  className="font-bold text-neutral-700 hover:underline"
                >
                  u/{community.creator?.username}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <PostFeed
        posts={posts}
        loading={postsLoading}
        sort={sort}
        onSortChange={handleSortChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
        communitySlug={community.slug}
      />
    </div>
  );
};

export default CommunityDetailPage;
