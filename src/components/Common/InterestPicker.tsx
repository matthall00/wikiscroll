import React, { useState, useEffect, useMemo } from 'react';
import StorageService from '../../services/storage';
import { fetchCategories } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const InterestPicker: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const storage = useMemo(() => StorageService.getInstance(), []);

  useEffect(() => {
    const userInterests = storage.getInterests();
    setInterests(userInterests.map(i => i.name));
  }, [storage]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedSearchTerm.length > 2) {
        setIsLoading(true);
        try {
          const categories = await fetchCategories(debouncedSearchTerm);
          setSuggestions(categories.map(c => c.title));
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    loadSuggestions();
    setSelectedIndex(-1);
  }, [debouncedSearchTerm]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      storage.removeInterest(interest);
      setInterests(interests.filter(i => i !== interest));
    } else {
      storage.addInterest(interest);
      setInterests([...interests, interest]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const suggestion = suggestions[selectedIndex];
          if (!interests.includes(suggestion)) {
            toggleInterest(suggestion);
            setSearchTerm('');
            setSuggestions([]);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchTerm('');
        setSuggestions([]);
        break;
    }
  };

  return (
    <div className="p-4" role="form" aria-label="Interest picker">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-white" id="current-interests">Your Interests</h2>
        <div 
          className="flex flex-wrap gap-2"
          role="list"
          aria-labelledby="current-interests"
        >
          {interests.length === 0 ? (
            <p className="text-slate-400 text-sm" role="status">Add some interests to customize your feed</p>
          ) : (
            interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label={`Remove ${interest} from interests`}
              >
                {interest}
                <span className="ml-1" aria-hidden="true">×</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-white" id="add-interests">Add Interests</h3>
        <div role="combobox" aria-expanded={suggestions.length > 0} aria-controls="interest-suggestions" aria-haspopup="listbox">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for categories..."
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            aria-label="Search categories"
            aria-activedescendant={selectedIndex >= 0 ? `suggestion-${suggestions[selectedIndex]}` : undefined}
            aria-autocomplete="list"
          />
        </div>

        {isLoading ? (
          <div 
            className="text-slate-400 text-sm p-2"
            role="status"
            aria-live="polite"
          >
            Loading suggestions...
          </div>
        ) : suggestions.length > 0 ? (
          <div 
            id="interest-suggestions"
            className="space-y-1"
            role="listbox"
            aria-label="Category suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                id={`suggestion-${suggestion}`}
                onClick={() => {
                  toggleInterest(suggestion);
                  setSearchTerm('');
                  setSuggestions([]);
                }}
                disabled={interests.includes(suggestion)}
                className={`w-full text-left px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  interests.includes(suggestion)
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : index === selectedIndex
                    ? 'bg-slate-600 text-white'
                    : 'hover:bg-slate-700 text-white'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
                aria-disabled={interests.includes(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : searchTerm.length > 2 ? (
          <div 
            className="text-slate-400 text-sm p-2"
            role="status"
            aria-live="polite"
          >
            No suggestions found
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-sm text-slate-400" aria-hidden="true">
        {"Use ↑↓ to navigate • Enter to select • Esc to clear"}
      </div>
    </div>
  );
};

export default InterestPicker;