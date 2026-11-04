/**
 * Noticias module - Live news feed for CubanCFCronology.
 * 
 * TODO: Integrate with a news provider (Directorio Cubano, NewsAPI, or APITube).
 * Currently a stub — returns empty state until a provider is configured.
 * 
 * Provider priority:
 * 1. Directorio Cubano (if open and accessible)
 * 2. NewsAPI (requires paid plan for serious use)
 * 3. APITube (alternative video/news provider)
 */

// Define the news item shape
export interface Noticia {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
}

// Configure the news collection
export const defineNewsCollection = () => ({
  // Collection name used for routing and storage
  name: 'noticias',

  // Items per page for pagination
  perPage: 10,

  // Route rule for the news page
  route: '/noticias',

  // Whether to prerender (true = static, false = SSR)
  prerender: false,

  // Default state when no provider is configured
  defaultState: {
    headlines: [] as Noticia[],
    loading: true,
    error: null as string | null,
  },
});

// Stub fetcher — returns empty state until a provider is integrated
export async function fetchNoticias(): Promise<{
  headlines: Noticia[];
  loading: boolean;
  error: string | null;
}> {
  // TODO: Implement real fetch from news provider
  return {
    headlines: [],
    loading: false,
    error: null,
  };
}

// Mock data for development until a provider is integrated
export const mockNoticias: Noticia[] = [
  {
    id: '1',
    title: 'Noticias de ciencia ficción cubanas',
    summary: 'Próximamente: integración con proveedor de noticias',
    source: 'CubanCFCronology',
    url: '#',
    publishedAt: new Date().toISOString(),
  },
];