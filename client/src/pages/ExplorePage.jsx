import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { CommunityCard } from '../components/communities/CommunityCard.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Search, Compass, Users } from 'lucide-react';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Technology',
    'Programming',
    'Design',
    'Gaming',
    'Science',
    'General',
    'Entertainment',
    'Education',
  ];

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const fetchCommunities = async (cat = selectedCategory, search = searchQuery) => {
    setLoading(true);
    try {
      let url = `/communities?category=${cat}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      if (res.data?.success) {
        setCommunities(res.data.communities);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleMembershipChange = (commId, newIsMember, newMemberCount) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c._id === commId
          ? { ...c, isMember: newIsMember, memberCount: newMemberCount }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200/80 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Explore Communities
            </h1>
            <p className="text-xs text-neutral-500">
              Discover active interest groups, subscribe to topics, and engage with enthusiasts
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities by name or topic description..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-neutral-400 shadow-subtle"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Community Grid */}
      {loading ? (
        <Loader message="Loading circles..." />
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((c) => (
            <CommunityCard
              key={c._id}
              community={c}
              onMembershipChange={handleMembershipChange}
            />
          ))}
        </div>
      ) : (
        <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-neutral-800">No circles match your search</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Try adjusting your search terms or select another category above.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
