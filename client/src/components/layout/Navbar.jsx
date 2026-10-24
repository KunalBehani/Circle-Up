import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Search,
  Plus,
  Compass,
  Flame,
  User,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = ({ onOpenCreateCommunity, onToggleMobileMenu }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white shadow-sm group-hover:shadow transition-shadow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="12" r="5" />
                  <circle cx="15" cy="12" r="5" strokeOpacity="0.7" />
                  <path d="M12 12h.01" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-neutral-900 group-hover:text-brand-600 transition-colors">
                  CircleUp
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase -mt-0.5">
                  Communities
                </span>
              </div>
            </Link>
          </div>

          {/* Central Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 hidden sm:block"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, topics, or communities..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-transparent focus:border-brand-500 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-neutral-900 placeholder:text-neutral-500"
              />
            </div>
          </form>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Post</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                      alt={user?.username}
                      className="w-7 h-7 rounded-lg bg-brand-50 object-cover"
                    />
                    <span className="text-xs font-semibold text-neutral-800 hidden md:inline">
                      {user?.username}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevation border border-neutral-200/80 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Signed in as</p>
                          <p className="font-semibold text-neutral-900 truncate">u/{user?.username}</p>
                          <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to={`/profile/${user?.username}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-600"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-brand-600"
                        >
                          <Settings className="w-4 h-4 text-neutral-400" />
                          <span>Settings</span>
                        </Link>

                        <div className="border-t border-neutral-100 my-1" />

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
