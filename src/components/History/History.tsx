import { useEffect, useState, useMemo, useCallback } from 'react';
import StorageService from '../../services/storage';
import ArticleCard from '../Feed/ArticleCard';
import { WikiArticle } from '../../services/api';
import ErrorState from '../Common/ErrorState';

const History = () => {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storage = useMemo(() => StorageService.getInstance(), []);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const viewedArticles = await storage.getHistory();
      setArticles(viewedArticles);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = async () => {
    try {
      await storage.clearHistory();
      setArticles([]);
    } catch (err) {
      setError(err as Error);
    }
  };

  if (error) {
    return <ErrorState message="Failed to load history" onRetry={loadHistory} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen pt-16 pb-20">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">History</h2>
        {articles.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 transition-colors rounded-lg text-white"
          >
            Clear History
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">⏱️</div>
            <h2 className="text-xl mb-2">No viewed articles yet</h2>
            <p className="text-slate-400">Articles you view will appear here</p>
          </div>
        </div>
      ) : (
        <div className="snap-container hide-scrollbar">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index}
              totalArticles={articles.length}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;