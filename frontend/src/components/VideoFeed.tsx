"use client";
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const fetchVideos = async (page: number) => {
  const response = await fetch(`/api/videos?page=${page}`);
  const data = await response.json();
  return data.videos || [];
};

export default function VideoFeed() {
  const { ref, inView } = useInView();
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const loadMoreVideos = async () => {
    const newVideos = await fetchVideos(page);
    setVideos(prev => [...prev, ...newVideos]);
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (inView) {
      loadMoreVideos();
    }
  }, [inView]);

  return (
    <>
      <div className="grid..."> {videos} </div>
      <div ref={ref} className="h-10 w-full">Downloading...</div>
    </>
  );
}