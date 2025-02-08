const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  try {
    lastRequestTime = Date.now();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      const delay = Math.min(1000 * 2 ** (MAX_RETRIES - retries), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export interface WikiArticle {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: string;
}

export const fetchRandomArticles = async (limit: number = 5): Promise<WikiArticle[]> => {
  const cacheKey = `random-articles-${limit}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  const cacheExpiry = sessionStorage.getItem(`${cacheKey}-expiry`);
  
  if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
    return JSON.parse(cachedData);
  }

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'random',
    grnnamespace: '0',
    grnlimit: limit.toString(),
    prop: 'extracts|pageimages',
    exintro: 'true',
    explaintext: 'true',
    piprop: 'thumbnail',
    pithumbsize: '400',
    origin: '*'
  });

  const response = await fetchWithRetry(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  if (!data.query?.pages) {
    throw new Error('No articles found');
  }

  const articles = Object.values(data.query.pages).map((page: any) => ({
    id: page.pageid,
    title: page.title,
    excerpt: page.extract?.substring(0, 200) + '...',
    thumbnail: page.thumbnail?.source
  }));

  // Cache for 5 minutes
  sessionStorage.setItem(cacheKey, JSON.stringify(articles));
  sessionStorage.setItem(`${cacheKey}-expiry`, (Date.now() + 5 * 60 * 1000).toString());

  return articles;
};

export interface WikiCategory {
  title: string;
  id: number;
}

export const fetchCategories = async (search: string): Promise<WikiCategory[]> => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: `incategory:${search}`,
    srnamespace: '14', // Category namespace
    srlimit: '10',
    origin: '*'
  });

  const response = await fetchWithRetry(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();

  if (!data.query?.search) {
    throw new Error('No categories found');
  }
  
  return data.query.search.map((result: any) => ({
    title: result.title.replace('Category:', ''),
    id: result.pageid
  }));
};

export interface FetchResult {
  articles: WikiArticle[];
  continuation?: string;
}

export const fetchArticlesByCategory = async (category: string, continuationToken?: string): Promise<FetchResult> => {
  const cacheKey = `category-${category}-${continuationToken || 'first'}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  const cacheExpiry = sessionStorage.getItem(`${cacheKey}-expiry`);

  if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
    return JSON.parse(cachedData);
  }

  // First, get the list of articles in the category
  const membersParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmlimit: '10',
    cmtype: 'page',
    origin: '*'
  });

  if (continuationToken) {
    membersParams.set('cmcontinue', continuationToken);
  }

  const membersResponse = await fetchWithRetry(`${WIKI_API_BASE}?${membersParams}`);
  const membersData = await membersResponse.json();

  if (!membersData.query?.categorymembers?.length) {
    return { articles: [] };
  }

  // Fetch content for articles
  const pageIds = membersData.query.categorymembers.map((m: any) => m.pageid).join('|');
  const contentParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    pageids: pageIds,
    prop: 'extracts|pageimages',
    exintro: 'true',
    explaintext: 'true',
    piprop: 'thumbnail',
    pithumbsize: '400',
    origin: '*'
  });

  const contentResponse = await fetchWithRetry(`${WIKI_API_BASE}?${contentParams}`);
  const contentData = await contentResponse.json();

  if (!contentData.query?.pages) {
    throw new Error('Failed to fetch article content');
  }

  const articles = Object.values(contentData.query.pages)
    .sort((a: any, b: any) => a.pageid - b.pageid)
    .map((page: any) => ({
      id: page.pageid,
      title: page.title,
      excerpt: page.extract?.substring(0, 200) + '...',
      thumbnail: page.thumbnail?.source
    }));

  const result = {
    articles,
    continuation: membersData.continue?.cmcontinue
  };

  // Cache for 5 minutes
  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  sessionStorage.setItem(`${cacheKey}-expiry`, (Date.now() + 5 * 60 * 1000).toString());

  return result;
};

export const searchArticles = async (query: string): Promise<WikiArticle[]> => {
  // First, search for articles
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: '0', // Main namespace only
    srlimit: '10',
    origin: '*'
  });

  const searchResponse = await fetchWithRetry(`${WIKI_API_BASE}?${searchParams}`);
  const searchData = await searchResponse.json();

  if (!searchData.query?.search?.length) {
    return [];
  }

  // Then, get the full content for these articles
  const pageIds = searchData.query.search.map((result: any) => result.pageid).join('|');
  const contentParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    pageids: pageIds,
    prop: 'extracts|pageimages',
    exintro: 'true',
    explaintext: 'true',
    piprop: 'thumbnail',
    pithumbsize: '400',
    origin: '*'
  });

  const contentResponse = await fetchWithRetry(`${WIKI_API_BASE}?${contentParams}`);
  const contentData = await contentResponse.json();

  if (!contentData.query?.pages) {
    throw new Error('Failed to fetch article content');
  }

  return Object.values(contentData.query.pages).map((page: any) => ({
    id: page.pageid,
    title: page.title,
    excerpt: page.extract?.substring(0, 200) + '...',
    thumbnail: page.thumbnail?.source
  }));
};
