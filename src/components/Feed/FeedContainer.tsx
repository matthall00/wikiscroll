import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useEffect, useRef, TouchEvent, useState, useCallback } from 'react';
import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import Header from '../Navigation/Header';
import InterestPicker from '../Common/InterestPicker';
import ErrorState from '../Common/ErrorState';
import StorageService from '../../services/storage';
import { fetchRandomArticles, fetchArticlesByCategory, WikiArticle } from '../../services/api';

const FeedContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WikiArticle[]>([]);
  const [showInterests, setShowInterests] = useState(false);
  const queryClient = useQueryClient();
  const storage = StorageService.getInstance();
  let touchStart = 0;

  const userInterests = storage.getInterests().map(i => i.name);

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
    setSearchResults([]);
    setShowInterests(false);
  }, [queryClient]);

  const handleSearchResults = useCallback((articles: WikiArticle[]) => {
    setSearchResults(articles);
    setShowInterests(false);
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
    ['articles', selectedCategory, userInterests],
    async ({ pageParam }) => {
      if (selectedCategory) {
        const result = await fetchArticlesByCategory(selectedCategory, pageParam);
        return {
          articles: result.articles,
          nextCursor: result.continuation
        };
      }
      
      if (userInterests.length > 0 && !selectedCategory) {
        const randomInterest = userInterests[Math.floor(Math.random() * userInterests.length)];
        try {
          const result = await fetchArticlesByCategory(randomInterest);
          if (result.articles.length >= 5) {
            return {
              articles: result.articles,
              nextCursor: result.continuation
            };
          }
        } catch (error) {
          console.error('Failed to fetch from interest:', error);
        }
      }
      
      const articles = await fetchRandomArticles(5);
      return {
        articles,
        nextCursor: articles.length === 5 ? pageParam + 1 : undefined
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      cacheTime: 0,
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
    : (data?.pages?.flatMap(page => page.articles) || []);

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

      {showInterests ? (
        <div className="fixed inset-0 z-40 bg-slate-900 pt-16 pb-20 overflow-auto">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Your Interests</h2>
              <button
                onClick={() => setShowInterests(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <InterestPicker />
          </div>
        </div>
      ) : (
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
      )}
      
      {selectedCategory ? (
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
      ) : (
        <button
          onClick={() => setShowInterests(true)}
          className="fixed bottom-20 right-6 z-40 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors"
        >
          {userInterests.length > 0 ? "✨ Interests" : "+ Add Interests"}
        </button>
      )}
    </>
  );
};

export default FeedContainer;
