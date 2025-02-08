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

### Phase 1: Core Feed
1. Set up project with Vite and dependencies
2. Implement basic vertical scroll container
3. Create ArticleCard component with placeholder data
4. Add Wikipedia API integration for random articles
5. Implement infinite scroll

### Phase 2: Content & Navigation
1. Add category browsing functionality
2. Implement search feature
3. Create navigation components
4. Add proper error handling and loading states

### Phase 3: User Features
1. Implement client-side storage for preferences
2. Add "save for later" functionality
3. Create viewed articles history
4. Add interest selection interface

### Phase 4: UI/UX Refinement
1. Add smooth transitions between articles
2. Implement loading placeholders
3. Add pull-to-refresh
4. Optimize image loading and caching

## Key Technical Considerations

### Performance
- Implement virtual scrolling for feed performance
- Optimize image loading with lazy loading
- Cache API responses
- Preload next articles

### Storage
Use a combination of:
- LocalStorage for user preferences
- IndexedDB for article cache and history
- Memory cache for current session data

### Error Handling
- Implement retry logic for failed API calls
- Show appropriate error states
- Fallback content for missing images

### Accessibility
- Keyboard navigation support
- Screen reader friendly content
- Proper ARIA labels
- Color contrast compliance

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