import React from 'react';
import { useState, useEffect } from 'react';
import StorageService from '../../services/storage';
import { WikiArticle } from '../../services/api';

interface SaveButtonProps {
  article: WikiArticle;
}

const SaveButton: React.FC<SaveButtonProps> = ({ article }) => {
  const [isSaved, setIsSaved] = useState(false);
  const storage = StorageService.getInstance();

  useEffect(() => {
    // Check if article is saved
    storage.getSavedArticles().then(articles => {
      setIsSaved(articles.some(a => a.id === article.id));
    });
  }, [article.id]);

  const handleSave = async () => {
    try {
      if (isSaved) {
        await storage.removeSavedArticle(article.id);
      } else {
        await storage.saveArticle(article);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save/unsave article:', error);
    }
  };

  return (
    <button
      onClick={handleSave}
      className={`p-2 rounded-full transition-colors ${
        isSaved 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
      aria-label={isSaved ? 'Unsave article' : 'Save article'}
    >
      {isSaved ? '⭐' : '☆'}
    </button>
  );
};

export default SaveButton;