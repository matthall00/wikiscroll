import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchCategories, WikiCategory } from '../../services/api';

interface CategorySelectorProps {
  onCategorySelect: (category: string | null) => void;
  activeCategory: string | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onCategorySelect, activeCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: categories, isLoading } = useQuery(
    ['categories', searchTerm],
    () => fetchCategories(searchTerm),
    {
      enabled: searchTerm.length > 2,
      staleTime: 300000, // 5 minutes
    }
  );

  const handleCategorySelect = (category: string) => {
    const newCategory = activeCategory === category ? null : category;
    onCategorySelect(newCategory);
    setSearchTerm('');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search categories..."
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeCategory && (
          <button
            onClick={() => handleCategorySelect(activeCategory)}
            className="px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      
      {searchTerm.length > 2 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg bg-slate-700">
          {isLoading ? (
            <div className="p-4 text-slate-400">Loading categories...</div>
          ) : categories?.length ? (
            <ul>
              {categories.map((category: WikiCategory) => (
                <li
                  key={category.id}
                  onClick={() => handleCategorySelect(category.title)}
                  className={`px-4 py-2 cursor-pointer ${
                    activeCategory === category.title 
                      ? 'bg-blue-500 text-white' 
                      : 'text-white hover:bg-slate-600'
                  }`}
                >
                  {category.title}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-slate-400">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;