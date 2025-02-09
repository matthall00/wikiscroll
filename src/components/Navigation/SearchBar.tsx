import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { searchArticles, WikiArticle } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface SearchBarProps {
  onSearchResults: (articles: WikiArticle[]) => void;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: articles = [], isLoading } = useQuery(
    ['search', debouncedSearchTerm],
    () => searchArticles(debouncedSearchTerm),
    {
      enabled: debouncedSearchTerm.length > 2,
      onSuccess: (data) => onSearchResults(data),
    }
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!articles?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, articles.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSearchResults([articles[selectedIndex]]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    setSelectedIndex(-1);
  }, [articles]);

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4"
      role="search"
      aria-label="Search articles"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search articles..."
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Search articles"
          aria-expanded={articles.length > 0}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `result-${articles[selectedIndex]?.id}` : undefined}
        />
        <button
          onClick={onClose}
          className="px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close search"
        >
          Close
        </button>
      </div>

      {debouncedSearchTerm.length > 2 && (
        <div 
          ref={resultsRef}
          id="search-results"
          className="mt-2 max-h-60 overflow-y-auto rounded-lg bg-slate-700"
          role="listbox"
          aria-label="Search results"
        >
          {isLoading ? (
            <div 
              className="p-4 text-slate-400"
              role="status"
              aria-live="polite"
            >
              Searching articles...
            </div>
          ) : articles.length > 0 ? (
            <ul>
              {articles.map((article, index) => (
                <li key={article.id}>
                  <button
                    id={`result-${article.id}`}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-600 focus:bg-slate-600 focus:outline-none ${
                      index === selectedIndex ? 'bg-slate-600' : ''
                    }`}
                    onClick={() => {
                      onSearchResults([article]);
                      onClose();
                    }}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div 
              className="p-4 text-slate-400"
              role="status"
              aria-live="polite"
            >
              No articles found
            </div>
          )}
        </div>
      )}
      
      <div className="mt-2 text-sm text-slate-400" aria-hidden="true">
        {'Use ↑↓ to navigate • Enter to select • Esc to close'}
      </div>
    </div>
  );
};

export default SearchBar;