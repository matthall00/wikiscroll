import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import FeedContainer from './components/Feed/FeedContainer'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen bg-slate-900">
          <FeedContainer />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
