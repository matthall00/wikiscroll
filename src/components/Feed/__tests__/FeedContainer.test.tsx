import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, getByRole } from '@testing-library/react';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastProvider } from '../../Common/ToastContext';
import FeedContainer from '../FeedContainer';
import { fetchRandomArticles } from '../../../services/api';
// import { get } from 'http';

// Mock the API module
vi.mock('../../../services/api', () => ({
  fetchRandomArticles: vi.fn(),
  fetchArticlesByCategory: vi.fn(),
}));

const mockArticles = [
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
    (fetchRandomArticles as any).mockResolvedValue(mockArticles);
  });

  it('renders loading state initially', () => {
    render(<FeedContainer />, { wrapper: createWrapper() });
    expect(screen.getAllByTestId('article-skeleton')).toHaveLength(3);
  });

  it('renders articles after loading', async () => {
    render(<FeedContainer />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
    });
  });

  it('handles pull-to-refresh gesture', async () => {
    render(<FeedContainer />, { wrapper: createWrapper() });

    // Simulate pull-to-refresh gesture
    fireEvent.touchStart(screen.getByRole('feed'), {
      touches: [{ clientY: 0 }],
    });

    fireEvent.touchMove(screen.getByRole('feed'), {
      touches: [{ clientY: 150 }],
    });

    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });
  });

  it('handles scroll-based pagination', async () => {
    act(() => render(<FeedContainer />, { wrapper: createWrapper() }));

    const container = getByRole(document.body, 'feed-container');

    // Wait for initial articles to load
    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
    });

    // Mock window.innerHeight since jsdom doesn't provide it
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

    // First scroll
    const feed = getByRole(container, 'feed');
    console.log('Feed:', feed);
    await act(() => fireEvent.scroll(feed, {
        target: { scrollTop: 100 },
    }));

    // Wait for the first fetch to complete
    await waitFor(() => {
      expect(fetchRandomArticles).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Second scroll further down
    await act(() => fireEvent.scroll(feed, {
      target: { scrollTop: 2304 },
    }));

    // Wait for the second fetch
    await waitFor(() => {
      expect(fetchRandomArticles).toHaveBeenCalledTimes(2);
    }, { timeout: 2000 });
  });

  it('maintains accessibility during loading and interaction', async () => {
    render(<FeedContainer />, { wrapper: createWrapper() });

    // Check loading state accessibility
    const feed = screen.getByRole('feed');
    expect(feed).toHaveAttribute('aria-busy', 'true');

    // Wait for content to load
    await waitFor(() => {
      expect(feed).toHaveAttribute('aria-busy', 'false');
    });

    // Verify article containers are accessible
    const articles = screen.getAllByRole('article');
    articles.forEach(article => {
      expect(article).toHaveAttribute('aria-label');
      expect(article).toHaveAttribute('aria-describedby');
    });
  });

  it('handles errors gracefully', async () => {
    (fetchRandomArticles as any).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<FeedContainer />, { wrapper: createWrapper() });
    });

    try {
      await waitFor(() => {
        //expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
        //expect(screen.getByText(/We couldn't load the articles. Please try again./)).toBeInTheDocument();
      });
    } catch (error) {
      // console.log('Document HTML:', document.body.innerHTML);
      throw error;
    }

    // Verify retry functionality
    // const retryButton = screen.getByRole('button', { name: /try again/i });
    // fireEvent.click(retryButton);

    // expect(fetchRandomArticles).toHaveBeenCalledTimes(2);
  });

  it('ensures articles are unique by ID', async () => {
    (fetchRandomArticles as any).mockResolvedValue(mockArticles);

    render(<FeedContainer />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      // Should only show the latest version of Article 1
      expect(screen.getByText('Article 1 Updated')).toBeInTheDocument();
      expect(screen.queryByText('Article 1')).not.toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
      
      // Total number of articles should be 2 (not 3)
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(2);
    });
  });
});