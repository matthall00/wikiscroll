import React from 'react';

const ArticleCardSkeleton = () => {
  return (
    <div className="h-screen w-full snap-start bg-slate-800 flex items-center justify-center">
      <div className="max-w-lg p-6 w-full">
        <div className="h-8 bg-slate-700 rounded w-3/4 mb-4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-700 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;
