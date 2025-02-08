import React, { useState, useEffect } from 'react';
import CategorySelector from './CategorySelector';
import SearchBar from './SearchBar';
import { WikiArticle } from '../../services/api';

interface HeaderProps {
  onCategorySelect: (category: string | null) => void;
  activeCategory: string | null;
  onSearchResults: (articles: WikiArticle[]) => void;
}

const Header: React.FC<HeaderProps> = ({ onCategorySelect, activeCategory, onSearchResults }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      
      // Show header when scrolling up, hide when scrolling down
      // But only if we've scrolled more than 10px to avoid tiny movements
      if (Math.abs(scrollDiff) > 10) {
        setIsVisible(scrollDiff < 0 || currentScrollY < 50);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleCloseSearch = () => {
    setIsSearching(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 transition-transform duration-200 ${
        !isVisible ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {isSearching ? (
        <SearchBar 
          onSearchResults={onSearchResults}
          onClose={handleCloseSearch}
        />
      ) : (
        <div className="flex items-center gap-2 p-4">
          <div className="flex-1">
            <CategorySelector 
              onCategorySelect={onCategorySelect}
              activeCategory={activeCategory}
            />
          </div>
          <button
            onClick={() => setIsSearching(true)}
            className="px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
            aria-label="Search articles"
          >
            🔍
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;