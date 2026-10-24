import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { PostCard } from '../components/posts/PostCard.jsx';
import { CommunityCard } from '../components/communities/CommunityCard.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Search, Hash, MessageSquare, AlertCircle } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'posts' | 'communities'
  const [results, setResults] = useState({ communities: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  const executeSearch = async (term) => {
    if (!term.trim()) {
      setResults({ communities: [], posts: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(term.trim())}`);
      if (res.data?.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.error('Search request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(queryParam);
  }, [queryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const totalResults = results.communities.length + results.posts.length;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="editorial-card p-5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts, titles, or communities..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {queryParam && (
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Found <strong className="text-neutral-900 font-bold">{totalResults}</strong> results for{' '}
              <strong className="text-brand-600 font-bold">"{queryParam}"</strong>
            </span>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('communities')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'communities'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Circles ({results.communities.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Discussions ({results.posts.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Rendering */}
      {loading ? (
        <Loader message="Searching across circles..." />
      ) : queryParam && totalResults === 0 ? (
        <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-neutral-800">No results found</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            We couldn't find any circles or posts matching "{queryParam}". Try checking for spelling errors or using different keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Matching Communities */}
          {(activeTab === 'all' || activeTab === 'communities') &&
            results.communities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Matching Communities ({results.communities.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.communities.map((c) => (
                    <CommunityCard key={c._id} community={c} />
                  ))}
                </div>
              </div>
            )}

          {/* Matching Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Matching Discussions ({results.posts.length})</span>
              </div>
              <div className="space-y-3.5">
                {results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
