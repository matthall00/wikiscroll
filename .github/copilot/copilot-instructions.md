# WikiScroll Development Guidelines

## Project Overview
WikiScroll is a TikTok-style Wikipedia reader built with React, TypeScript, and Vite. These guidelines ensure consistent code quality and maintainable architecture.

## Core Principles

### 1. Component Architecture
- Follow atomic design principles
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement error boundaries where appropriate

### 2. State Management
- Use React Query for server state
- Prefer local state when possible
- Follow immutability patterns
- Document complex state interactions

### 3. Performance Guidelines
- Implement virtualization for long lists
- Lazy load images and components
- Use React.memo() strategically
- Profile before optimizing

### 4. Accessibility Standards
```typescript
// Example component with accessibility features
const ArticleCard = ({ article, onNavigate }) => {
  return (
    <article
      role="article"
      aria-labelledby="title"
      tabIndex={0}
    >
      <h2 id="title">{article.title}</h2>
      {/* Content */}
    </article>
  );
};
```

- Include proper ARIA attributes
- Support keyboard navigation
- Test with screen readers
- Handle reduced motion preferences

### 5. Error Handling
```typescript
// Example error handling pattern
try {
  await api.fetchArticle(id);
} catch (error) {
  if (error instanceof RateLimitError) {
    showToast('Please try again later');
  } else {
    captureError(error);
  }
}
```

- Use typed error classes
- Provide user-friendly messages
- Log errors appropriately
- Implement retry mechanisms

### 6. Testing Strategy
- Write unit tests for utilities
- Integration tests for components
- E2E tests for critical flows
- Mock external dependencies

### 7. CSS/Styling Guidelines
```typescript
// Example Tailwind usage
const Button = ({ variant = 'primary' }) => (
  <button
    className={`
      px-4 py-2 rounded-lg transition-colors
      ${variant === 'primary' 
        ? 'bg-blue-500 hover:bg-blue-600' 
        : 'bg-gray-500 hover:bg-gray-600'}
    `}
  >
    {/* Content */}
  </button>
);
```

- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use CSS variables for theming

### 8. API Integration
```typescript
// Example API service pattern
class WikipediaService {
  private static handleError(error: Error) {
    // Error handling logic
  }

  async fetchArticle(id: string) {
    try {
      // API call
    } catch (error) {
      WikipediaService.handleError(error);
    }
  }
}
```

- Implement proper error handling
- Use TypeScript interfaces
- Cache responses appropriately
- Handle rate limiting

### 9. Storage Patterns
```typescript
// Example storage service usage
const storage = new StorageService();
await storage.saveArticle({
  id,
  title,
  content,
  savedAt: Date.now()
});
```

- Use IndexedDB for large data
- LocalStorage for preferences
- Implement data expiry
- Handle storage limits

### 10. Code Style
- Use consistent naming conventions
- Document complex functions
- Keep functions pure when possible
- Follow ESLint configurations

## File Organization
```
src/
├── components/        # React components
│   ├── Feed/         # Feed-related components
│   ├── Common/       # Shared components
│   └── Navigation/   # Navigation components
├── hooks/            # Custom React hooks
├── services/         # API and storage services
└── types/            # TypeScript type definitions
```

## Git Workflow
1. Create feature branches
2. Follow commit conventions
3. Update documentation
4. Include tests
5. Request peer review

## Development Process
1. Understanding Requirements
   - Review feature specifications
   - Consider edge cases
   - Plan implementation approach

2. Implementation
   - Write tests first
   - Implement feature
   - Add documentation
   - Test accessibility

3. Code Review
   - Self-review checklist
   - Peer review
   - Address feedback
   - Update tests

4. Testing
   - Unit tests
   - Integration tests
   - Accessibility testing
   - Performance testing

5. Documentation
   - Update README
   - Add JSDoc comments
   - Document breaking changes
   - Update examples

## Best Practices

### Components
```typescript
// Good component structure
interface Props {
  article: Article;
  onSave?: (id: string) => void;
}

const ArticleCard: React.FC<Props> = ({ 
  article, 
  onSave 
}) => {
  // Implementation
};
```

### Hooks
```typescript
// Good hook pattern
const useArticle = (id: string) => {
  const { data, error } = useQuery(['article', id], () => 
    api.fetchArticle(id)
  );

  return {
    article: data,
    isLoading: !error && !data,
    isError: error
  };
};
```

### Error Boundaries
```typescript
// Example error boundary usage
<ErrorBoundary fallback={<ErrorState />}>
  <ArticleViewer />
</ErrorBoundary>
```

### Testing
```typescript
// Example test pattern
describe('ArticleCard', () => {
  it('renders article content', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });
});
```

## Troubleshooting Guide
1. Common Issues
   - API rate limiting
   - Storage quota exceeded
   - Performance bottlenecks

2. Debug Tools
   - React DevTools
   - Chrome Performance tab
   - Lighthouse
   - Error monitoring

## Additional Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)