const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

export interface WikiArticle {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: string;
}

export const fetchRandomArticles = async (limit: number = 5): Promise<WikiArticle[]> => {
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

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  return Object.values(data.query.pages).map((page: any) => ({
    id: page.pageid,
    title: page.title,
    excerpt: page.extract?.substring(0, 200) + '...',
    thumbnail: page.thumbnail?.source
  }));
};
