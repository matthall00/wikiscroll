import React, { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { searchArticles, WikiArticle } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface SearchBarProps {
  onSearchResults: (articles: WikiArticle[]) => void;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const { data: articles, isLoading } = useQuery(
    ['search', debouncedSearchTerm],
    () => searchArticles(debouncedSearchTerm),
    {
      enabled: debouncedSearchTerm.length > 2,
      onSuccess: (data) => onSearchResults(data),
    }
  );

  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search articles..."
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <button
          onClick={handleClose}
          className="px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>

      {debouncedSearchTerm.length > 2 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg bg-slate-700">
          {isLoading ? (
            <div className="p-4 text-slate-400">Searching articles...</div>
          ) : articles?.length ? (
            <ul>
              {articles.map((article) => (
                <li
                  key={article.id}
                  className="px-4 py-2 text-white hover:bg-slate-600 cursor-pointer"
                >
                  {article.title}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-slate-400">No articles found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;