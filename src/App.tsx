import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import FeedContainer from './components/Feed/FeedContainer'
import SavedArticles from './components/SavedArticles/SavedArticles'
import History from './components/History/History'
import BottomNav, { NavigationSection } from './components/Navigation/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

function App() {
  const [currentSection, setCurrentSection] = useState<NavigationSection>('feed');

  const renderSection = () => {
    switch (currentSection) {
      case 'feed':
        return <FeedContainer />;
      case 'saved':
        return <SavedArticles />;
      case 'history':
        return <History />;
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
