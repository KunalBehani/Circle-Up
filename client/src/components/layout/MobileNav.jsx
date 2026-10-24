import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Home,
  Flame,
  Compass,
  PlusCircle,
  User,
  X,
  Plus,
  LogIn,
  Search,
} from 'lucide-react';

export const MobileDrawer = ({ isOpen, onClose, onOpenCreateCommunity }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileQuery, setMobileQuery] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(mobileQuery.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-elevation z-50 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                CU
              </div>
              <span className="font-bold text-base text-neutral-900">CircleUp</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="Search circles & posts..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-neutral-900"
              />
            </div>
          </form>

          <div className="mt-4 space-y-1">
            <NavLink
              to="/"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-700'
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home Feed</span>
            </NavLink>
            <NavLink
              to="/popular"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-700'
                }`
              }
            >
              <Flame className="w-4 h-4 text-accent-amber" />
              <span>Popular Discussions</span>
            </NavLink>
            <NavLink
              to="/explore"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-700'
                }`
              }
            >
              <Compass className="w-4 h-4 text-brand-600" />
              <span>Explore Communities</span>
            </NavLink>

            <button
              onClick={() => {
                onClose();
                onOpenCreateCommunity();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-brand-700 hover:bg-brand-50 text-left"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>Create New Circle</span>
            </button>
          </div>
        </div>

        {/* User profile footer */}
        <div className="pt-4 border-t border-neutral-100">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Link
                to={`/profile/${user?.username}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                  alt={user?.username}
                  className="w-8 h-8 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 truncate">u/{user?.username}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 py-2 text-center text-xs font-semibold border border-neutral-300 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 py-2 text-center text-xs font-semibold bg-brand-600 text-white rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MobileBottomBar = ({ onOpenCreateCommunity }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-neutral-200/80 px-2 py-1.5 flex items-center justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium ${
            isActive ? 'text-brand-600' : 'text-neutral-500'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/popular"
        className={({ isActive }) =>
          `flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium ${
            isActive ? 'text-brand-600' : 'text-neutral-500'
          }`
        }
      >
        <Flame className="w-5 h-5 mb-0.5" />
        <span>Popular</span>
      </NavLink>

      <Link
        to={isAuthenticated ? '/submit' : '/login'}
        className="flex items-center justify-center w-10 h-10 -mt-4 rounded-full bg-brand-600 text-white shadow-elevation"
        aria-label="Create post"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </Link>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium ${
            isActive ? 'text-brand-600' : 'text-neutral-500'
          }`
        }
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? `/profile/${user?.username}` : '/login'}
        className={({ isActive }) =>
          `flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium ${
            isActive ? 'text-brand-600' : 'text-neutral-500'
          }`
        }
      >
        {isAuthenticated ? (
          <User className="w-5 h-5 mb-0.5" />
        ) : (
          <LogIn className="w-5 h-5 mb-0.5" />
        )}
        <span>{isAuthenticated ? 'Profile' : 'Log In'}</span>
      </NavLink>
    </nav>
  );
};
