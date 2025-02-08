import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import FeedContainer from './components/Feed/FeedContainer'
import BottomNav, { NavigationSection } from './components/Navigation/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('feed');

  const renderSection = () => {
    switch (currentSection) {
      case 'feed':
        return <FeedContainer />;
      case 'saved':
        // We'll implement these in Phase 3
        return <div className="h-screen flex items-center justify-center text-white">Saved Articles Coming Soon</div>;
      case 'history':
        return <div className="h-screen flex items-center justify-center text-white">History Coming Soon</div>;
      default:
        return <FeedContainer />;
    }
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen bg-slate-900">
          {renderSection()}
          <BottomNav 
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
