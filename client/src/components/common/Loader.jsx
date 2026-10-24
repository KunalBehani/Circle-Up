import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-600`} />
      {message && <p className="text-sm font-medium text-neutral-500">{message}</p>}
    </div>
  );
};

export const PostSkeleton = () => {
  return (
    <div className="editorial-card p-5 animate-pulse flex gap-4">
      {/* Vote skeleton */}
      <div className="flex flex-col items-center gap-2 pt-1 w-8">
        <div className="w-6 h-6 bg-neutral-200 rounded"></div>
        <div className="w-4 h-4 bg-neutral-200 rounded"></div>
        <div className="w-6 h-6 bg-neutral-200 rounded"></div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-neutral-200"></div>
          <div className="w-24 h-4 bg-neutral-200 rounded"></div>
          <div className="w-16 h-3 bg-neutral-100 rounded"></div>
        </div>
        <div className="w-3/4 h-5 bg-neutral-200 rounded"></div>
        <div className="w-full h-12 bg-neutral-100 rounded"></div>
        <div className="flex gap-4 pt-2">
          <div className="w-20 h-4 bg-neutral-200 rounded"></div>
          <div className="w-16 h-4 bg-neutral-100 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
