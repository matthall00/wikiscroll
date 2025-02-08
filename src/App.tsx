import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import FeedContainer from './components/Feed/FeedContainer'
import SavedArticles from './components/SavedArticles/SavedArticles'
import History from './components/History/History'
import BottomNav, { NavigationSection } from './components/Navigation/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Common/ToastContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 60 * 1000, // Data is fresh for 1 minute
      cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
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
        <ToastProvider>
          <div className="h-screen bg-slate-900">
            {renderSection()}
            <BottomNav 
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
            />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
