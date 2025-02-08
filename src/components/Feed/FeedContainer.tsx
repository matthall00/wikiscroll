import { useInfiniteQuery } from 'react-query';
import { useEffect, useRef, TouchEvent } from 'react';
import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import { fetchRandomArticles, WikiArticle } from '../../services/api';

const FeedContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  let touchStart = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStart = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return;
    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;
    
    // Prevent overscroll at boundaries
    if (
      (containerRef.current.scrollTop <= 0 && diff < 0) ||
      (containerRef.current.scrollHeight - containerRef.current.scrollTop <= containerRef.current.clientHeight && diff > 0)
    ) {
      e.preventDefault();
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery(
    'articles',
    ({ pageParam = 1 }) => fetchRandomArticles(5),
    {
      getNextPageParam: (lastPage, pages) => pages.length + 1,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const articles = data?.pages.flat() || [];

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-4">Error: {(error as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="snap-container hide-scrollbar bg-slate-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))
      ) : (
        articles.map((article: WikiArticle) => (
          <ArticleCard key={article.id} article={article} />
        ))
      )}
      {isFetchingNextPage && <ArticleCardSkeleton />}
      <div ref={containerRef} className="h-20" />
    </div>
  );
};

export default FeedContainer;
