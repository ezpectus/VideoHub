import type { Video } from '@/services/apiClient';
import { videoApi } from '@/services/apiClient';

export async function fetchSearchResults(query: string): Promise<Video[]> {
  try {
    const { data } = await videoApi.getAll();
    // Client-side filter until a dedicated search endpoint exists
    return data.filter((v: Video) =>
      v.title.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}