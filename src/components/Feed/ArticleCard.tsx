import { useEffect } from 'react';
import { WikiArticle } from '../../services/api';
import SaveButton from '../Common/SaveButton';
import StorageService from '../../services/storage';

interface ArticleProps {
  article: WikiArticle;
}

const ArticleCard = ({ article }: ArticleProps) => {
  useEffect(() => {
    // Track article view
    const storage = StorageService.getInstance();
    storage.addToHistory(article).catch(console.error);
  }, [article]);

  return (
    <div className="h-screen w-full snap-item bg-slate-800 flex items-center justify-center relative">
      {article.thumbnail && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.thumbnail})` }}
        />
      )}
      <div className="max-w-lg p-6 text-white relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold pr-4">{article.title}</h2>
          <SaveButton article={article} />
        </div>
        <p className="text-gray-300">{article.excerpt}</p>
      </div>
    </div>
  );
};

export default ArticleCard;
