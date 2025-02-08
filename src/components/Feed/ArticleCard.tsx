import React from 'react';
import { WikiArticle } from '../../services/api';

interface ArticleProps {
  article: WikiArticle;
}

const ArticleCard = ({ article }: ArticleProps) => {
  return (
    <div className="h-screen w-full snap-item bg-slate-800 flex items-center justify-center relative">
      {article.thumbnail && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.thumbnail})` }}
        />
      )}
      <div className="max-w-lg p-6 text-white relative z-10">
        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
        <p className="text-gray-300">{article.excerpt}</p>
      </div>
    </div>
  );
};

export default ArticleCard;
