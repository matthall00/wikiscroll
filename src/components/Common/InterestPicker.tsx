import React, { useState, useEffect } from 'react';
import StorageService from '../../services/storage';
import { fetchCategories } from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const InterestPicker: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const storage = StorageService.getInstance();

  useEffect(() => {
    // Load user's interests
    const userInterests = storage.getInterests();
    setInterests(userInterests.map(i => i.name));
  }, []);

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

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-white">Your Interests</h2>
        <div className="flex flex-wrap gap-2">
          {interests.length === 0 ? (
            <p className="text-slate-400 text-sm">Add some interests to customize your feed</p>
          ) : (
            interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                {interest}
                <span className="ml-1">×</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">Add Interests</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for categories..."
          className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />

        {isLoading ? (
          <div className="text-slate-400 text-sm p-2">Loading suggestions...</div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  toggleInterest(suggestion);
                  setSearchTerm('');
                  setSuggestions([]);
                }}
                disabled={interests.includes(suggestion)}
                className={`w-full text-left px-3 py-2 rounded ${
                  interests.includes(suggestion)
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-700 text-white'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : searchTerm.length > 2 ? (
          <div className="text-slate-400 text-sm p-2">No suggestions found</div>
        ) : null}
      </div>
    </div>
  );
};

export default InterestPicker;