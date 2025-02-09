import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { QueryClient } from 'react-query';

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
  constructor(callback: IntersectionObserverCallback) {
    setTimeout(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], this), 0);
  }
}

window.IntersectionObserver = MockIntersectionObserver as typeof IntersectionObserver;

// Mock ResizeObserver with proper implementation
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(callback: ResizeObserverCallback) {
    setTimeout(() => callback([{ 
      contentRect: { width: 800, height: 600 } 
    } as ResizeObserverEntry], this), 0);
  }
}

window.ResizeObserver = MockResizeObserver as typeof ResizeObserver;

// Mock matchMedia with proper implementation
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock IndexedDB
const mockIDBStore = {
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  createIndex: vi.fn(),
};

const mockIDBTransaction = {
  objectStore: vi.fn().mockReturnValue(mockIDBStore),
};

const mockIDBDatabase = {
  transaction: vi.fn().mockReturnValue(mockIDBTransaction),
  createObjectStore: vi.fn().mockReturnValue(mockIDBStore),
  objectStoreNames: { contains: vi.fn() },
};

window.indexedDB = {
  open: vi.fn().mockReturnValue({
    result: mockIDBDatabase,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  }),
  cmp: vi.fn(),
  databases: vi.fn().mockResolvedValue([]),
  deleteDatabase: vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onerror: null,
    onsuccess: null,
  }),
};

// Mock ToastContext
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

// Mock MSW handlers for Wikipedia API
export const handlers = [
  http.get('https://en.wikipedia.org/w/api.php', () => {
    return HttpResponse.json({
      query: {
        pages: {
          '123': {
            pageid: 123,
            title: 'Test Article',
            extract: 'Test article content...',
            thumbnail: { source: 'test-image.jpg' },
          },
        },
      },
    });
  }),
];

const server = setupServer(...handlers);

// Start MSW server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Configure test environment
beforeEach(() => {
  // Create a new QueryClient for each test
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Clean up after all tests
afterAll(() => server.close());