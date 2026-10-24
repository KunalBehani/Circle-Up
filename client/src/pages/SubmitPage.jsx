import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import api from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { FileText, Link2, Send, AlertCircle } from 'lucide-react';

export const SubmitPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCommunitySlug = searchParams.get('community') || '';

  const { success, error: toastError } = useToast();

  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [type, setType] = useState('text'); // 'text' | 'link'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCommunities, setFetchingCommunities] = useState(true);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/submit');
    }
  }, [isAuthenticated, navigate]);

  // Load available communities
  useEffect(() => {
    const fetchAllCommunities = async () => {
      try {
        const res = await api.get('/communities?limit=100');
        if (res.data?.success) {
          setCommunities(res.data.communities);
          if (initialCommunitySlug) {
            const matched = res.data.communities.find(
              (c) => c.slug.toLowerCase() === initialCommunitySlug.toLowerCase()
            );
            if (matched) {
              setSelectedCommunity(matched._id);
            }
          } else if (res.data.communities.length > 0) {
            setSelectedCommunity(res.data.communities[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load communities for submission:', err);
      } finally {
        setFetchingCommunities(false);
      }
    };

    fetchAllCommunities();
  }, [initialCommunitySlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCommunity) {
      setError('Please choose a circle community to post in');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (type === 'link') {
      try {
        const parsed = new URL(linkUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('URL must start with http:// or https://');
          return;
        }
      } catch {
        setError('Please enter a valid URL (e.g. https://example.com)');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        body: body.trim(),
        type,
        linkUrl: type === 'link' ? linkUrl.trim() : undefined,
        communityId: selectedCommunity,
      });

      if (res.data?.success) {
        success('Discussion published!');
        navigate(`/post/${res.data.post._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish post';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-neutral-200/80 pb-3">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Create a Discussion
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Share interesting thoughts, questions, or external web articles with your community
        </p>
      </div>

      <div className="editorial-card p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Community Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Choose a Circle <span className="text-rose-500">*</span>
            </label>
            {fetchingCommunities ? (
              <div className="h-10 bg-neutral-100 rounded-xl animate-pulse"></div>
            ) : communities.length > 0 ? (
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {communities.map((c) => (
                  <option key={c._id} value={c._id}>
                    c/{c.slug} — {c.name} ({c.memberCount} members)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-rose-600">
                No communities available. Create one first!
              </p>
            )}
          </div>

          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Post Format
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'text'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-subtle'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Text Discussion</span>
              </button>

              <button
                type="button"
                onClick={() => setType('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  type === 'link'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-subtle'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Link / Article</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <Input
              label="Post Title"
              placeholder="What would you like to discuss or highlight?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={300}
            />
            <p className="text-[11px] text-right text-neutral-400 mt-1">
              {title.length}/300 characters
            </p>
          </div>

          {/* Link URL (if type is link) */}
          {type === 'link' && (
            <div>
              <Input
                label="Destination Link"
                placeholder="https://example.com/interesting-article"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                required
                icon={Link2}
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Must include http:// or https:// protocol
              </p>
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              {type === 'link' ? 'Optional Commentary / Context' : 'Post Content'}
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide background context, analysis, or talking points..."
              maxLength={10000}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-neutral-400"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={loading || fetchingCommunities}
              icon={Send}
            >
              Publish Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;
