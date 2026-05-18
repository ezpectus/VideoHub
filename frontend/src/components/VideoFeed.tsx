"use client";
import { useInView } from 'react-intersection-observer';
import { useCallback, useState } from 'react';

interface FeedVideo {
  id: string;
  title?: string;
}

const fetchVideos = async (page: number) => {
  const response = await fetch(`/api/videos?page=${page}`);
  const data: { videos?: FeedVideo[] } = await response.json();
  return data.videos || [];
};

export default function VideoFeed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreVideos = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newVideos = await fetchVideos(page);
    setVideos(prev => [...prev, ...newVideos]);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, page]);

  const { ref } = useInView({
    onChange: (visible: boolean) => {
      if (visible) {
        void loadMoreVideos();
      }
    }
  });

  return (
    <>
      <div className="grid...">
        {videos.map((video) => (
          <div key={video.id}>{video.title ?? video.id}</div>
        ))}
      </div>
      <div ref={ref} className="h-10 w-full">{isLoading ? 'Downloading...' : 'Scroll to load more'}</div>
    </>
  );
}