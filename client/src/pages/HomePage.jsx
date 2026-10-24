import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { PostFeed } from '../components/posts/PostFeed.jsx';

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchPosts = async (sortOption = sort, page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?sort=${sortOption}&page=${page}&limit=15`);
      if (res.data?.success) {
        setPosts(res.data.posts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(sort, pagination.page);
  }, [sort, pagination.page]);

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

  return (
    <div className="space-y-5">
      <div className="border-b border-neutral-200/80 pb-3">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Community Feed
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Recent discussions and shared links across all CircleUp communities
        </p>
      </div>

      <PostFeed
        posts={posts}
        loading={loading}
        sort={sort}
        onSortChange={handleSortChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
};

export default HomePage;
