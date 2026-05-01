import { redirect } from 'next/navigation';
import VideoCard from '../../components/VideoCard';
import { fetchSearchResults } from '../../components/search';
import type { Video } from '@/services/apiClient';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q;
  
  if (!q) {
    redirect('/');
  }

  const results: Video[] = await fetchSearchResults(q);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Results for: &quot;{q}&quot;</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((video: Video) => (
           <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}