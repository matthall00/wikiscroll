import { describe, it, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastProvider } from '../../Common/ToastContext';
import FeedContainer from '../FeedContainer';
import { fetchRandomArticles } from '../../../services/api';
import type { WikiArticle } from '../../../services/api';

// Mock the API module
vi.mock('../../../services/api', () => ({
  fetchRandomArticles: vi.fn(),
  fetchArticlesByCategory: vi.fn(),
}));

const mockArticles: WikiArticle[] = [
  {
    id: 1,
    title: 'Article 1',
    excerpt: 'Excerpt 1...',
    thumbnail: 'image1.jpg',
  },
  {
    id: 2,
    title: 'Article 2',
    excerpt: 'Excerpt 2...',
    thumbnail: 'image2.jpg',
  },
  // Add duplicate article with same ID but different content
  {
    id: 1,
    title: 'Article 1 Updated',
    excerpt: 'Updated excerpt...',
    thumbnail: 'image1_updated.jpg',
  },
];

// Create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        suspense: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('FeedContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', async () => {
    vi.useFakeTimers();
    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockArticles), 1000))
    );

    const { container } = render(<FeedContainer />, { wrapper: createWrapper() });

    expect(screen.getAllByTestId('article-skeleton')).toHaveLength(3);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('renders articles after loading', async () => {
    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>).mockResolvedValueOnce(mockArticles);
    
    render(<FeedContainer />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(fetchRandomArticles).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Article 1 Updated')).toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
    });
  });

  it('handles pull-to-refresh gesture', async () => {
    const initialArticles = [...mockArticles];
    const refreshedArticles = [
      { id: 3, title: 'New Article', excerpt: 'New excerpt...', thumbnail: 'new.jpg' },
      ...mockArticles
    ];

    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>)
      .mockResolvedValueOnce(initialArticles)
      .mockResolvedValueOnce(refreshedArticles);

    render(<FeedContainer />, { wrapper: createWrapper() });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Article 1 Updated')).toBeInTheDocument();
    });

    const feed = screen.getByRole('feed');
    Object.defineProperty(feed, 'scrollTop', { configurable: true, value: 0 });

    // Simulate pull-to-refresh
    await act(async () => {
      fireEvent.touchStart(feed, { touches: [{ clientY: 0 }] });
      fireEvent.touchMove(feed, { touches: [{ clientY: 150 }] });
      fireEvent.touchEnd(feed);
    });

    // Verify refresh state and new content
    await waitFor(() => {
      expect(screen.getByText('New Article')).toBeInTheDocument();
      expect(fetchRandomArticles).toHaveBeenCalledTimes(2);
    });
  });

  // it('handles scroll-based pagination', async () => {
  //   (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>)
  //     .mockResolvedValueOnce(mockArticles)
  //     .mockResolvedValueOnce([
  //       { id: 3, title: 'Article 3', excerpt: 'Excerpt 3...', thumbnail: 'image3.jpg' }
  //     ]);
    
  //   render(<FeedContainer />, { wrapper: createWrapper() });

  //   // Wait for initial load
  //   await waitFor(() => {
  //     expect(screen.getByText('Article 1 Updated')).toBeInTheDocument();
  //   });

  //   const feed = screen.getByRole('feed');
    
  //   // Trigger scroll near bottom
  //   await act(async () => {
  //     Object.defineProperty(feed, 'scrollHeight', { configurable: true, value: 3000 });
  //     Object.defineProperty(feed, 'clientHeight', { configurable: true, value: 768 });
  //     Object.defineProperty(feed, 'scrollTop', { configurable: true, value: 2000 });
  //     fireEvent.scroll(feed);
  //   });

  //   // Wait for second load
  //   await waitFor(() => {
  //     expect(fetchRandomArticles).toHaveBeenCalledTimes(2);
  //   });
  // });

  it('maintains accessibility during loading and interaction', async () => {
    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>).mockResolvedValueOnce(mockArticles);
    
    render(<FeedContainer />, { wrapper: createWrapper() });

    // Check loading state
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true');

    // Wait for content and check final state
    await waitFor(() => {
      const feed = screen.getByRole('feed');
      expect(feed).toHaveAttribute('aria-busy', 'false');
      
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThan(0);
      articles.forEach(article => {
        expect(article).toHaveAttribute('aria-label');
        expect(article).toHaveAttribute('aria-describedby');
      });
    });
  });

  it('handles errors gracefully', async () => {
    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>)
      .mockRejectedValueOnce(new Error('API Error'));

    render(<FeedContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Articles')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't load the articles/)).toBeInTheDocument();
    });
  });

  it('ensures articles are unique by ID', async () => {
    (fetchRandomArticles as MockedFunction<() => Promise<WikiArticle[]>>)
      .mockResolvedValueOnce(mockArticles);

    render(<FeedContainer />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      // Only latest version should be shown
      expect(screen.getByText('Article 1 Updated')).toBeInTheDocument();
      expect(screen.queryByText('Article 1')).not.toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
      
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(2);
    });
  });
});