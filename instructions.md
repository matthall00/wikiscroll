# WikiScroll - A TikTok-style Wikipedia Reader

## Project Overview
WikiScroll is a modern, engaging way to discover Wikipedia content through a TikTok-like interface. Users can vertically scroll through full-screen Wikipedia articles, save their favorites, and explore content through different discovery methods.

## Core Features
- Vertical scrolling feed with smooth transitions
- Full-screen article cards with:
  - Background image from the article
  - Article title
  - Brief excerpt/summary
  - Link to full Wikipedia article
- Multiple content discovery methods:
  - Random articles feed
  - Category-based browsing
  - Interest-based customization
  - Search functionality
- User preferences:
  - Save articles for later
  - Track viewed articles
  - Manage interests/categories

## Technical Stack
- Vite + React
- TailwindCSS for styling
- React Query for data fetching
- LocalStorage/IndexedDB for client-side storage
- GitHub Pages for hosting

## API Integration
### Wikipedia API Endpoints
- Random Articles: `/w/api.php?action=query&format=json&generator=random`
- Category Articles: `/w/api.php?action=query&list=categorymembers`
- Article Content: `/w/api.php?action=query&prop=extracts|pageimages`
- Search: `/w/api.php?action=query&list=search`

Note: Implement proper CORS handling and rate limiting

## Project Structure
```
src/
├── components/
│   ├── Feed/
│   │   ├── ArticleCard.tsx
│   │   ├── FeedContainer.tsx
│   │   └── SwipeHandler.tsx
│   ├── Navigation/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   └── Common/
├── hooks/
│   ├── useWikipediaAPI.ts
│   ├── useInfiniteScroll.ts
│   └── useLocalStorage.ts
├── services/
│   ├── api.ts
│   └── storage.ts
├── stores/
│   └── userPreferences.ts
└── types/
    └── index.ts
```

## Implementation Phases

### Phase 1: Core Feed ✅
1. Set up project with Vite and dependencies ✅
   - Configure Vite with React and TypeScript
   - Set up TailwindCSS
   - Add React Query for data fetching
2. Implement basic vertical scroll container ✅
   - Add snap scrolling behavior
   - Implement touch event handling
   - Add scroll-based pagination
3. Create ArticleCard component with styling ✅
   - Add background image with overlay
   - Implement title and excerpt display
   - Create loading skeleton
4. Add Wikipedia API integration ✅
   - Set up API service with TypeScript types
   - Implement random article fetching
   - Handle CORS and error states
5. Implement infinite scroll ✅
   - Add React Query infinite query
   - Implement intersection observer
   - Add loading states

### Phase 2: Content & Navigation 🔄
1. Add category browsing functionality
   - Create CategorySelector component
   - Implement category-based article fetching
   - Add category filter state management
2. Implement search feature
   - Create SearchBar component
   - Add search results view
   - Implement debounced search API calls
3. Create navigation components
   - Implement collapsible Header
   - Create BottomNav with icons
   - Add navigation state management
4. Add proper error handling
   - Implement error boundaries for routes
   - Add retry logic for failed API calls
   - Create error state components

### Phase 3: User Features
1. Implement client-side storage
   - Set up LocalStorage wrapper
   - Create IndexedDB schema for articles
   - Add storage service interface
2. Add "save for later" functionality
   - Create SaveButton component
   - Implement article saving logic
   - Add saved articles view
3. Create viewed articles history
   - Track viewed articles in storage
   - Create history view component
   - Add clear history functionality
4. Add interest selection
   - Create InterestPicker component
   - Implement interest-based filtering
   - Add user preferences persistence

### Phase 4: UI/UX Refinement
1. Add smooth transitions
   - Implement article transition animations
   - Add loading state animations
   - Optimize animation performance
2. Improve loading experience
   - Add progressive image loading
   - Implement content placeholders
   - Add pull-to-refresh gesture
3. Performance optimization
   - Implement virtual scrolling
   - Add image lazy loading
   - Optimize bundle size
4. Accessibility improvements
   - Add keyboard navigation
   - Implement ARIA labels
   - Test screen reader compatibility

## Key Technical Considerations

### Performance
- Virtual Scrolling Implementation
  - Use Intersection Observer for viewport detection
  - Unmount off-screen articles to reduce DOM nodes
  - Keep 3-5 articles in memory at a time
- Image Optimization
  - Use next-gen formats (WebP with JPEG fallback)
  - Implement progressive loading with blur placeholder
  - Preload images for next 2-3 articles
- Caching Strategy
  - Cache API responses with React Query
  - Implement stale-while-revalidate pattern
  - Use service worker for offline support
- Performance Metrics
  - Target First Contentful Paint < 1.5s
  - Maintain 60fps scroll performance
  - Keep bundle size under 100KB (gzipped)

### Storage Architecture
- LocalStorage
  - User preferences and settings
  - Current session state
  - Recently viewed article IDs
- IndexedDB
  - Article cache with TTL
  - Saved articles with full content
  - Reading history with timestamps
- Memory Cache
  - Current feed articles
  - Preloaded next page
  - Search results

### Error Handling Strategy
- API Error Handling
  - Implement exponential backoff for retries
  - Show appropriate error states per component
  - Cache last successful response as fallback
- Content Fallbacks
  - Default placeholder images
  - Truncated content handling
  - Offline mode indicators
- User Feedback
  - Toast notifications for actions
  - Loading states with estimated time
  - Error recovery suggestions

### Accessibility Implementation
- Keyboard Navigation
  - Arrow keys for article navigation
  - Shortcut keys for common actions
  - Focus management between articles
- Screen Reader Support
  - Proper heading hierarchy
  - Article landmark regions
  - Live region updates for dynamic content
- Visual Accessibility
  - Minimum contrast ratio 4.5:1
  - Scalable text support
  - Motion reduction support
- Semantic Structure
  - Proper HTML5 elements
  - ARIA landmarks and labels
  - Clear focus indicators

## Development Guidelines
1. Use TypeScript for all components and functions
2. Implement proper error boundaries
3. Use React Query for data fetching and caching
4. Follow TailwindCSS best practices
5. Implement proper loading states
6. Use proper semantic HTML
7. Write unit tests for critical functionality

## Deployment
1. Set up GitHub Actions for automated deployment
2. Configure GitHub Pages
3. Set up proper caching headers
4. Implement monitoring and analytics

Would you like me to expand on any of these sections or should we adjust anything in the plan?