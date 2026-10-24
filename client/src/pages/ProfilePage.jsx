import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { PostCard } from '../components/posts/PostCard.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { formatRelativeTime } from '../utils/formatters.js';
import {
  Calendar,
  Sparkles,
  MessageSquare,
  FileText,
  Settings,
  AlertCircle,
} from 'lucide-react';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'comments'

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/${username}`);
        if (res.data?.success) {
          setProfile(res.data.user);
          setPosts(res.data.posts || []);
          setComments(res.data.comments || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || `User '${username}' not found.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const isOwnProfile = currentUser && currentUser.username === username;

  if (loading) {
    return <Loader message="Loading member profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">User Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          {error || `The user account u/${username} does not exist.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Surface */}
      <div className="editorial-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-16 h-16 rounded-2xl bg-brand-50 object-cover ring-2 ring-brand-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  u/{profile.username}
                </h1>
                {isOwnProfile && (
                  <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Joined {formatRelativeTime(profile.joinedAt)}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
            {profile.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-6 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent-amber" />
            <strong className="text-neutral-900 font-bold">{profile.totalKarma || 0}</strong>
            <span>Karma</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-600" />
            <strong className="text-neutral-900 font-bold">{profile.postCount || 0}</strong>
            <span>Discussions</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <strong className="text-neutral-900 font-bold">{profile.commentCount || 0}</strong>
            <span>Comments</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'posts'
              ? 'bg-neutral-900 text-white shadow-subtle'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Discussions ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'comments'
              ? 'bg-neutral-900 text-white shadow-subtle'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments ({comments.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        posts.length > 0 ? (
          <div className="space-y-3.5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))}
          </div>
        ) : (
          <div className="editorial-card p-10 text-center text-xs text-neutral-400">
            No discussions published by u/{profile.username} yet.
          </div>
        )
      ) : comments.length > 0 ? (
        <div className="editorial-card divide-y divide-neutral-100 p-4 space-y-2">
          {comments.map((comment) => (
            <div key={comment._id} className="py-3 first:pt-0 last:pb-0 space-y-1">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Commented on</span>
                {comment.post && (
                  <Link
                    to={`/post/${comment.post._id}`}
                    className="font-bold text-neutral-800 hover:text-brand-600 truncate max-w-md"
                  >
                    "{comment.post.title}"
                  </Link>
                )}
                <span>•</span>
                <span>{formatRelativeTime(comment.createdAt)}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="editorial-card p-10 text-center text-xs text-neutral-400">
          No comments authored by u/{profile.username} yet.
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
