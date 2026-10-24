import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import api from '../../services/api.js';
import {
  Home,
  Flame,
  Compass,
  PlusCircle,
  Hash,
  Users,
} from 'lucide-react';

export const LeftSidebar = ({ onOpenCreateCommunity }) => {
  const { isAuthenticated, user } = useAuth();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setJoinedCommunities([]);
      return;
    }

    const fetchJoined = async () => {
      setLoading(true);
      try {
        const res = await api.get('/communities');
        if (res.data?.success) {
          const joined = res.data.communities.filter((c) => c.isMember);
          setJoinedCommunities(joined);
        }
      } catch (err) {
        console.error('Failed to load user communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJoined();
  }, [isAuthenticated, user]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
    }`;

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 space-y-6">
      {/* Primary Feeds */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Feeds
        </p>
        <NavLink to="/" className={navLinkClass} end>
          <Home className="w-4 h-4 text-neutral-500" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/popular" className={navLinkClass}>
          <Flame className="w-4 h-4 text-accent-amber" />
          <span>Popular</span>
        </NavLink>
        <NavLink to="/explore" className={navLinkClass}>
          <Compass className="w-4 h-4 text-brand-600" />
          <span>Explore Communities</span>
        </NavLink>
      </div>

      {/* Community Creation Action */}
      <div className="pt-2 border-t border-neutral-200/80">
        <button
          onClick={onOpenCreateCommunity}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100/80 rounded-xl transition-colors border border-brand-200/60"
        >
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-600" />
            Create Community
          </span>
          <span className="text-[10px] font-bold uppercase bg-white px-1.5 py-0.5 rounded text-brand-600 border border-brand-200">
            New
          </span>
        </button>
      </div>

      {/* Joined Communities */}
      <div className="space-y-1 pt-2 border-t border-neutral-200/80">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            My Communities
          </p>
          <Users className="w-3.5 h-3.5 text-neutral-400" />
        </div>

        {isAuthenticated ? (
          joinedCommunities.length > 0 ? (
            <div className="space-y-0.5">
              {joinedCommunities.map((c) => (
                <NavLink
                  key={c._id}
                  to={`/c/${c.slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-200/70 text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`
                  }
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                    style={{ backgroundColor: c.bannerColor || '#4F46E5' }}
                  >
                    c/
                  </span>
                  <span className="truncate">{c.name}</span>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
              No communities joined yet. Explore and join your interests!
            </div>
          )
        ) : (
          <div className="px-3 py-3 text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200/80">
            Sign in to subscribe to your favorite circles.
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-1 pt-2 border-t border-neutral-200/80">
        <p className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Top Topics
        </p>
        {['Technology', 'Programming', 'Design', 'Gaming', 'Science'].map((cat) => (
          <NavLink
            key={cat}
            to={`/explore?category=${cat}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:text-brand-600 hover:bg-neutral-100 transition-colors"
          >
            <Hash className="w-3.5 h-3.5 text-neutral-400" />
            <span>{cat}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default LeftSidebar;
