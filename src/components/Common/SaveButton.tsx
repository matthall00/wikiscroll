import React, { useState, useEffect, useMemo } from 'react';
import StorageService from '../../services/storage';
import { WikiArticle } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface SaveButtonProps {
  article: WikiArticle;
  'aria-describedby'?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ article, "aria-describedby": describedBy }) => {
  const [isSaved, setIsSaved] = useState(false);
  const storage = useMemo(() => StorageService.getInstance(), []);
  const { showToast } = useToast();

  useEffect(() => {
    storage.getSavedArticles().then(articles => {
      setIsSaved(articles.some(a => a.id === article.id));
    });
  }, [article.id, storage]);

  const handleSave = async () => {
    try {
      if (isSaved) {
        await storage.removeSavedArticle(article.id);
        showToast(`Removed "${article.title}" from saved articles`, 'info');
      } else {
        await storage.saveArticle(article);
        showToast(`Saved "${article.title}" for later`, 'success');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save/unsave article:', error);
      showToast('Failed to save article. Please try again.', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <button
      onClick={handleSave}
      onKeyDown={handleKeyDown}
      className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
        isSaved 
          ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400' 
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-400'
      }`}
      aria-label={isSaved ? `Unsave ${article.title}` : `Save ${article.title}`}
      aria-pressed={isSaved}
      aria-describedby={describedBy}
    >
      <span className="sr-only">{isSaved ? 'Unsave article' : 'Save article'}</span>
      <span aria-hidden="true">{isSaved ? '⭐' : '☆'}</span>
    </button>
  );
};

export default SaveButton;