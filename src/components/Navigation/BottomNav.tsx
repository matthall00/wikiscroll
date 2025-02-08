import React from 'react';

export type NavigationSection = 'feed' | 'saved' | 'history';

interface BottomNavProps {
  currentSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onSectionChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-4 py-2 z-50">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center">
        <button
          onClick={() => onSectionChange('feed')}
          className={`flex flex-col items-center p-2 ${
            currentSection === 'feed' ? 'text-blue-500' : 'text-slate-400'
          }`}
          aria-label="Feed"
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs mt-1">Feed</span>
        </button>
        <button
          onClick={() => onSectionChange('saved')}
          className={`flex flex-col items-center p-2 ${
            currentSection === 'saved' ? 'text-blue-500' : 'text-slate-400'
          }`}
          aria-label="Saved"
        >
          <span className="text-xl">⭐</span>
          <span className="text-xs mt-1">Saved</span>
        </button>
        <button
          onClick={() => onSectionChange('history')}
          className={`flex flex-col items-center p-2 ${
            currentSection === 'history' ? 'text-blue-500' : 'text-slate-400'
          }`}
          aria-label="History"
        >
          <span className="text-xl">⏱️</span>
          <span className="text-xs mt-1">History</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;