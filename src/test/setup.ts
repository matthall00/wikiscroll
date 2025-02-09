import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
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

// Mock matchMedia
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
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

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Clean up after all tests
afterAll(() => server.close());