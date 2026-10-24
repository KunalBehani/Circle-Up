import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="editorial-card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 font-black text-2xl mx-auto">
        404
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Circle or Page Not Found
      </h1>
      <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
        The destination you are looking for doesn't exist, has been archived, or was moved to another topic.
      </p>

      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold rounded-xl transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Circles</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
