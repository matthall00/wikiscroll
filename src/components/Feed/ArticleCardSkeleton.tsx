import React from 'react';

const ArticleCardSkeleton = () => {
  return (
    <div className="h-screen w-full snap-item bg-slate-800 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 to-slate-800/50 animate-pulse" />
      <div className="max-w-lg w-full p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="h-8 bg-slate-700 rounded-lg w-3/4 mb-2 animate-pulse" />
            <div className="h-6 bg-slate-700 rounded-lg w-1/2 animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-700 rounded w-4/6 animate-pulse" />
        </div>
        <div className="mt-6">
          <div className="h-10 w-32 bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-600/10 to-transparent" />
    </div>
  );
};

export default ArticleCardSkeleton;
