import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastProvider } from '../../Common/ToastContext';
import ArticleCard from '../ArticleCard';
import type { WikiArticle } from '../../../services/api';

const mockArticle: WikiArticle = {
  id: 1,
  title: 'Test Article',
  excerpt: 'Test excerpt...',
  thumbnail: 'test.jpg',
  position: 1,
  totalArticles: 2,
};

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
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('ArticleCard', () => {
  it('renders article content correctly', () => {
    render(<ArticleCard article={mockArticle} index={0} totalArticles={2} />, { wrapper: createWrapper() });
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test excerpt...')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const { container } = render(<ArticleCard article={mockArticle} index={0} totalArticles={2} />, { wrapper: createWrapper() });
    const article = container.querySelector('article');
    expect(article).toHaveAttribute('tabindex', '0');
    
    fireEvent.keyDown(article!, { key: 'Enter' });
    // Add assertions for keyboard navigation
  });

  it('shows correct article position', () => {
    render(<ArticleCard article={mockArticle} index={0} totalArticles={2} />, { wrapper: createWrapper() });
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('maintains accessibility features', () => {
    const { container } = render(<ArticleCard article={mockArticle} index={0} totalArticles={2} />, { wrapper: createWrapper() });
    const article = container.querySelector('article');
    expect(article).toHaveAttribute('role', 'article');
    expect(article).toHaveAttribute('aria-labelledby');
  });
});