import React from 'react';

export type NavigationSection = 'feed' | 'saved' | 'history';

interface BottomNavProps {
  currentSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onSectionChange }) => {
  const handleKeyDown = (e: React.KeyboardEvent, section: NavigationSection) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSectionChange(section);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-4 py-2 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-screen-xl mx-auto flex justify-around items-center">
        <button
          onClick={() => onSectionChange('feed')}
          onKeyDown={(e) => handleKeyDown(e, 'feed')}
          className={`flex flex-col items-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            currentSection === 'feed' ? 'text-blue-500 focus:ring-blue-400' : 'text-slate-400 focus:ring-slate-400'
          }`}
          aria-label="Feed"
          aria-current={currentSection === 'feed' ? 'page' : undefined}
        >
          <span className="text-xl" aria-hidden="true">🏠</span>
          <span className="text-xs mt-1">Feed</span>
        </button>
        <button
          onClick={() => onSectionChange('saved')}
          onKeyDown={(e) => handleKeyDown(e, 'saved')}
          className={`flex flex-col items-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            currentSection === 'saved' ? 'text-blue-500 focus:ring-blue-400' : 'text-slate-400 focus:ring-slate-400'
          }`}
          aria-label="Saved articles"
          aria-current={currentSection === 'saved' ? 'page' : undefined}
        >
          <span className="text-xl" aria-hidden="true">⭐</span>
          <span className="text-xs mt-1">Saved</span>
        </button>
        <button
          onClick={() => onSectionChange('history')}
          onKeyDown={(e) => handleKeyDown(e, 'history')}
          className={`flex flex-col items-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            currentSection === 'history' ? 'text-blue-500 focus:ring-blue-400' : 'text-slate-400 focus:ring-slate-400'
          }`}
          aria-label="Browsing history"
          aria-current={currentSection === 'history' ? 'page' : undefined}
        >
          <span className="text-xl" aria-hidden="true">⏱️</span>
          <span className="text-xs mt-1">History</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;