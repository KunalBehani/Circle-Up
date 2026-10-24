import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { TrendingUp, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { JoinButton } from '../communities/JoinButton.jsx';

export const RightSidebar = () => {
  const [topCommunities, setTopCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await api.get('/communities?sort=members&limit=5');
        if (res.data?.success) {
          setTopCommunities(res.data.communities);
        }
      } catch (err) {
        console.error('Failed to load top communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, []);

  return (
    <aside className="w-80 shrink-0 hidden xl:block sticky top-20 self-start space-y-5">
      {/* Platform Intro Card */}
      <div className="editorial-card p-5 bg-gradient-to-br from-white to-brand-50/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900">About CircleUp</h4>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          An interest-based community discussion platform. Create circles, publish discussions, share web links, and upvote quality content.
        </p>
        <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>Active Nodes: 5</span>
          <span>Community First</span>
        </div>
      </div>

      {/* Trending Communities Card */}
      <div className="editorial-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h4 className="font-bold text-sm text-neutral-900">Trending Circles</h4>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            See all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200"></div>
                  <div className="w-24 h-4 bg-neutral-200 rounded"></div>
                </div>
                <div className="w-14 h-7 bg-neutral-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : topCommunities.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {topCommunities.map((c) => (
              <div key={c._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                <Link to={`/c/${c.slug}`} className="flex items-center gap-2.5 min-w-0 group">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white font-bold shrink-0"
                    style={{ backgroundColor: c.bannerColor || '#4F46E5' }}
                  >
                    c/
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 group-hover:text-brand-600 transition-colors truncate">
                      c/{c.slug}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </Link>

                <JoinButton
                  communityId={c._id}
                  initialIsMember={c.isMember}
                  size="sm"
                  onToggle={(newMemberState, newCount) => {
                    setTopCommunities((prev) =>
                      prev.map((item) =>
                        item._id === c._id
                          ? { ...item, isMember: newMemberState, memberCount: newCount }
                          : item
                      )
                    );
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No circles found.</p>
        )}
      </div>

      {/* Community Guidelines */}
      <div className="editorial-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-sm text-neutral-900">Community Rules</h4>
        </div>
        <ul className="text-xs text-neutral-600 space-y-2 list-decimal list-inside">
          <li>Be respectful and constructive.</li>
          <li>Share original sources for links.</li>
          <li>Post in the relevant circle topic.</li>
          <li>Vote on quality, not just agreement.</li>
        </ul>
      </div>

      {/* Footer Info */}
      <footer className="px-2 text-[11px] text-neutral-400 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-neutral-600">Home</Link>
          <Link to="/explore" className="hover:text-neutral-600">Explore</Link>
          <Link to="/popular" className="hover:text-neutral-600">Popular</Link>
          <span>•</span>
          <span>CircleUp © 2026</span>
        </div>
        <p>Undergraduate Software Engineering Capstone</p>
      </footer>
    </aside>
  );
};

export default RightSidebar;
