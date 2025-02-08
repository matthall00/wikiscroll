import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useEffect, useRef, TouchEvent, useState, useCallback } from 'react';
import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import Header from '../Navigation/Header';
import ErrorState from '../Common/ErrorState';
import { fetchRandomArticles, fetchArticlesByCategory, WikiArticle } from '../../services/api';

const FeedContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WikiArticle[]>([]);
  const queryClient = useQueryClient();
  let touchStart = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStart = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return;
    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;
    
    if (
      (containerRef.current.scrollTop <= 0 && diff < 0) ||
      (containerRef.current.scrollHeight - containerRef.current.scrollTop <= containerRef.current.clientHeight && diff > 0)
    ) {
      e.preventDefault();
    }
  };

  const handleCategorySelect = useCallback(async (category: string | null) => {
    await queryClient.cancelQueries(['articles']);
    queryClient.removeQueries(['articles']);
    setSelectedCategory(category);
    setSearchResults([]); // Clear search results when changing category
  }, [queryClient]);

  const handleSearchResults = useCallback((articles: WikiArticle[]) => {
    setSearchResults(articles);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery(
    ['articles', selectedCategory],
    async ({ pageParam }) => {
      try {
        if (selectedCategory) {
          const result = await fetchArticlesByCategory(selectedCategory, pageParam);
          return {
            articles: result.articles,
            nextCursor: result.continuation
          };
        }
        const articles = await fetchRandomArticles(5);
        return {
          articles,
          nextCursor: articles.length === 5 ? pageParam + 1 : undefined
        };
      } catch (err) {
        // Log error for monitoring
        console.error('Failed to fetch articles:', err);
        throw err;
      }
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      retry: 3, // Retry failed requests up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    }
  );

  useEffect(() => {
    refetch();
  }, [selectedCategory, refetch]);

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

  const articles = searchResults.length > 0 
    ? searchResults 
    : (data?.pages.flatMap(page => page.articles) || []);

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorState 
          message={`Failed to load articles: ${(error as Error).message}`}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <>
      <Header
        onCategorySelect={handleCategorySelect}
        activeCategory={selectedCategory}
        onSearchResults={handleSearchResults}
      />

      <div 
        ref={containerRef}
        className="snap-container hide-scrollbar bg-slate-900 pt-16 pb-20"
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
        {!searchResults.length && isFetchingNextPage && <ArticleCardSkeleton />}
        <div ref={containerRef} className="h-20" />
      </div>
      
      {selectedCategory && (
        <div className="fixed bottom-20 right-6 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
          <span>{selectedCategory}</span>
          <button
            onClick={() => handleCategorySelect(null)}
            className="ml-2 hover:text-blue-200 transition-colors"
            aria-label="Clear category"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default FeedContainer;
