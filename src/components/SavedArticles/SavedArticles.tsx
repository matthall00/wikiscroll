import { useEffect, useState } from 'react';
import StorageService from '../../services/storage';
import ArticleCard from '../Feed/ArticleCard';
import { WikiArticle } from '../../services/api';
import ErrorState from '../Common/ErrorState';

const SavedArticles = () => {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const storage = StorageService.getInstance();

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    try {
      setIsLoading(true);
      const savedArticles = await storage.getSavedArticles();
      setArticles(savedArticles.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorState message="Failed to load saved articles" onRetry={loadSavedArticles} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white">Loading saved articles...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⭐</div>
          <h2 className="text-xl mb-2">No saved articles yet</h2>
          <p className="text-slate-400">Articles you save will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="snap-container hide-scrollbar bg-slate-900 pt-16 pb-20">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default SavedArticles;