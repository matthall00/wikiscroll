import { useEffect, useState, KeyboardEvent } from 'react';
import { WikiArticle } from '../../services/api';
import SaveButton from '../Common/SaveButton';
import OptimizedImage from '../Common/OptimizedImage';
import StorageService from '../../services/storage';
import { useMotionPreference } from '../../hooks/useMotionPreference';

interface ArticleProps {
  article: WikiArticle;
  onNext?: () => void;
  onPrevious?: () => void;
  index: number;
  totalArticles: number;
}

const ArticleCard = ({ article, onNext, onPrevious, index, totalArticles }: ArticleProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { allowTransitions } = useMotionPreference();

  useEffect(() => {
    const storage = StorageService.getInstance();
    storage.addToHistory(article).catch(console.error);
    
    requestAnimationFrame(() => setIsLoaded(true));
  }, [article]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        onNext?.();
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        onPrevious?.();
        break;
      case ' ':
        if (e.target === e.currentTarget) {
          e.preventDefault();
          window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`, '_blank');
        }
        break;
      default:
        break;
    }
  };

  return (
    <article 
      className={`h-screen w-full snap-item bg-slate-800 flex items-center justify-center relative ${
        allowTransitions ? 'transition-opacity duration-500' : ''
      } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      tabIndex={0}
      role="article"
      aria-label={`Article ${index + 1} of ${totalArticles}: ${article.title}`}
      onKeyDown={handleKeyDown}
      aria-roledescription="Article card"
      aria-describedby={`article-description-${article.id}`}
    >
      {article.thumbnail && (
        <OptimizedImage
          src={article.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loadingClassName="absolute inset-0 bg-slate-700 animate-pulse"
        />
      )}
      <div 
        className={`max-w-lg p-6 text-white relative z-10 transition-transform duration-500 ${
          isLoaded ? 'translate-y-0' : 'translate-y-4'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold pr-4" id={`article-title-${article.id}`}>
            {article.title}
          </h2>
          <SaveButton 
            article={article}
            aria-describedby={`article-title-${article.id}`}
          />
        </div>
        <p 
          className="text-gray-300" 
          id={`article-description-${article.id}`}
          aria-label="Article excerpt"
        >
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Read full article about ${article.title} on Wikipedia`}
          >
            Read More
          </a>
          <div className="text-sm text-slate-400" role="status" aria-live="polite">
            Article {index + 1} of {totalArticles}
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-slate-400 pointer-events-none select-none" aria-hidden="true">
        Press ↑↓ or j/k to navigate • Space to read more
      </div>
    </article>
  );
};

export default ArticleCard;
