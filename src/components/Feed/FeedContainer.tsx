import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useEffect, useRef, TouchEvent, useState, useCallback, useMemo } from 'react';
import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';
import Header from '../Navigation/Header';
import InterestPicker from '../Common/InterestPicker';
import CustomErrorPage from '../Common/CustomErrorPage';
import StorageService from '../../services/storage';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';
import { fetchRandomArticles, fetchArticlesByCategory, WikiArticle } from '../../services/api';

const FeedContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WikiArticle[]>([]);
  const [showInterests, setShowInterests] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const queryClient = useQueryClient();
  const storage = StorageService.getInstance();
  let touchStart = 0;

  const userInterests = storage.getInterests().map(i => i.name);

  // Virtual scroll implementation
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
    async ({ pageParam = 1 }) => {
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
          const result = await fetchArticlesByCategory(randomInterest, pageParam);
          if (result.articles.length > 0) {
            return {
              articles: result.articles,
              nextCursor: result.continuation || pageParam + 1
            };
          }
        } catch (error) {
          console.error('Failed to fetch from interest:', error);
        }
      }
      
      const articles = await fetchRandomArticles(pageParam);
      return {
        articles,
        nextCursor: articles.length > 0 ? pageParam + 1 : undefined
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      staleTime: 60 * 1000, // Consider data stale after 1 minute
      retry: 0,
      onError: () => {
        setRetryAttempts(prev => prev + 1);
      },
      // Add suspense mode to prevent loading states
      suspense: false,
      // Add keepPreviousData to prevent flash of loading state
      keepPreviousData: true,
    }
  );

  // Memoize articles array to prevent unnecessary re-renders and ensure uniqueness
  const articles = useMemo(() => {
    const articlesArray = searchResults.length > 0 
      ? searchResults 
      : (data?.pages?.flatMap(page => page.articles) || []);
    
    // Use a Map to keep only the latest version of each article by ID
    const uniqueArticles = new Map();
    articlesArray.forEach(article => {
      uniqueArticles.set(article.id, article);
    });
    
    return Array.from(uniqueArticles.values());
  }, [searchResults, data?.pages]);

  const { virtualItems } = useVirtualScroll(articles, {
    itemHeight: window.innerHeight,
    overscan: 2,
    containerRef,
  });

  const handleTouchStart = (e: TouchEvent) => {
    touchStart = e.touches[0].clientY;
    if (containerRef.current?.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return;
    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;
    
    // Pull-to-refresh logic
    if (containerRef.current.scrollTop === 0 && touchEnd > pullStartY && !isRefreshing) {
      const pullDistance = touchEnd - pullStartY;
      if (pullDistance > 100) {
        //e.preventDefault();
        console.log('Refreshing...');
        setIsRefreshing(true);
        refetch().finally(() => {
          console.log('Refresh complete');
          setIsRefreshing(false);
          setPullStartY(0);
        });
      }
    }
    
    // Prevent overscroll
    if (
      (containerRef.current.scrollTop <= 0 && diff < 0) ||
      (containerRef.current.scrollHeight - containerRef.current.scrollTop <= containerRef.current.clientHeight && diff > 0)
    ) {
      e.preventDefault();
    }
  };

  const handleCategorySelect = useCallback(async (category: string | null) => {
    if (category === selectedCategory) return;
    await queryClient.cancelQueries(['articles']);
    queryClient.removeQueries(['articles']);
    setSelectedCategory(category);
    setSearchResults([]);
    setShowInterests(false);
  }, [queryClient, selectedCategory]);

  const handleSearchResults = useCallback((articles: WikiArticle[]) => {
    setSearchResults(articles);
    setShowInterests(false);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryAttempts(0);
    refetch();
  }, [refetch]);

  // Preload next page when we're close to the end
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const preloadDistance = 2; // Start preloading when 2 articles from the end
    const currentArticles = articles.length;
    const virtualIndex = Math.floor(
      (containerRef.current?.scrollTop || 0) / window.innerHeight
    );

    if (currentArticles - virtualIndex <= preloadDistance) {
      fetchNextPage();
    }
  }, [articles.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update scroll handler to check for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isFetchingNextPage || !hasNextPage) return;

      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      const scrollThreshold = 200; // pixels from bottom
      
      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        console.log('Loading more articles...');
        fetchNextPage();
      }
    };

    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isError) {
    console.log('Rendering error state');
    console.log('Error:', error);
    return (
      <CustomErrorPage 
        title="Failed to Load Articles"
        message={`We couldn't load the articles. ${retryAttempts < 3 ? 'Please try again.' : 'Please check your connection and try again later.'}`}
        onRetry={retryAttempts < 3 ? handleRetry : undefined}
        code={error instanceof Error ? error.message : undefined}
      />
    );
  }

  return (
    <div role="feed-container">
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
        <>
          {/* Pull-to-refresh indicator */}
          {isRefreshing && (
            <div className="fixed top-16 left-0 right-0 z-50 flex justify-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm animate-bounce">
                Refreshing...
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            className="snap-container hide-scrollbar bg-slate-900 pt-16 pb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{
              height: '100vh',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
            role="feed"
            aria-busy={isLoading || isFetchingNextPage}
            aria-live="polite"
          >
            <div 
              style={{ 
                height: `${articles.length * window.innerHeight}px`,
                position: 'relative' 
              }}
            >
              {isLoading && !articles.length ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))
              ) : (
                virtualItems.map((virtualIndex) => {
                  const article = articles[virtualIndex];
                  return (
                    <div
                      key={article.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        transform: `translateY(${virtualIndex * window.innerHeight}px)`,
                      }}
                    >
                      <ArticleCard 
                        article={article}
                        index={virtualIndex}
                        totalArticles={articles.length}
                        onNext={() => {
                          const nextIndex = virtualIndex + 1;
                          if (nextIndex < articles.length) {
                            containerRef.current?.scrollTo({
                              top: nextIndex * window.innerHeight,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        onPrevious={() => {
                          const prevIndex = virtualIndex - 1;
                          if (prevIndex >= 0) {
                            containerRef.current?.scrollTo({
                              top: prevIndex * window.innerHeight,
                              behavior: 'smooth'
                            });
                          }
                        }}
                      />
                    </div>
                  );
                })
              )}
              {!searchResults.length && isFetchingNextPage && (
                <div style={{ 
                  position: 'absolute',
                  top: articles.length * window.innerHeight,
                  width: '100%'
                }}>
                  <ArticleCardSkeleton />
                </div>
              )}
            </div>
          </div>
        </>
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
          className="fixed bottom-24 right-3 z-40 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors"
        >
          {userInterests.length > 0 ? "✨ Interests" : "+ Add Interests"}
        </button>
      )}
    </div>
  );
};

export default FeedContainer;
