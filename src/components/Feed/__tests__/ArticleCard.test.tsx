import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastProvider } from '../../Common/ToastContext';
import ArticleCard from '../ArticleCard';

const mockArticle = {
  id: 123,
  title: 'Test Article',
  excerpt: 'This is a test article excerpt...',
  thumbnail: 'test-image.jpg',
};

// Create a wrapper with necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('ArticleCard', () => {
  it('renders article content correctly', () => {
    render(
      <ArticleCard
        article={mockArticle}
        index={0}
        totalArticles={1}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
    expect(screen.getByLabelText(/read full article/i)).toHaveAttribute(
      'href',
      `https://en.wikipedia.org/wiki/${encodeURI(mockArticle.title)}`
    );
  });

  it('handles keyboard navigation', () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <ArticleCard
        article={mockArticle}
        index={1}
        totalArticles={3}
        onNext={onNext}
        onPrevious={onPrevious}
      />,
      { wrapper: createWrapper() }
    );

    const article = screen.getByRole('article');
    fireEvent.keyDown(article, { key: 'ArrowDown' });
    expect(onNext).toHaveBeenCalled();

    fireEvent.keyDown(article, { key: 'ArrowUp' });
    expect(onPrevious).toHaveBeenCalled();

    fireEvent.keyDown(article, { key: 'j' });
    expect(onNext).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(article, { key: 'k' });
    expect(onPrevious).toHaveBeenCalledTimes(2);
  });

  it('shows correct article position', () => {
    render(
      <ArticleCard
        article={mockArticle}
        index={2}
        totalArticles={5}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Article 3 of 5')).toBeInTheDocument();
  });

  it('maintains accessibility features', () => {
    render(
      <ArticleCard
        article={mockArticle}
        index={0}
        totalArticles={1}
      />,
      { wrapper: createWrapper() }
    );

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', expect.stringContaining(mockArticle.title));
    expect(screen.getByRole('link', { name: /read full article/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/save/i)).toBeInTheDocument();
  });
});