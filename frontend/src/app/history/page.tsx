'use client';

import { useEffect, useState } from 'react';
import { videoApi, Video } from '@/services/apiClient';
import VideoCard from '@/components/VideoCard'; 

export default function HistoryPage() {
  const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedHistory = localStorage.getItem('watchHistory');
        
        if (!storedHistory) {
          setLoading(false);
          return;
        }

        const ids: string[] = JSON.parse(storedHistory);

        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const promises = ids.map(id =>
          videoApi.getById(id).catch(err => {
            console.error(`Ошибка загрузки видео ${id}:`, err);
            return null; 
          })
        );

        const results = await Promise.all(promises);

        const validVideos = results
          .filter(res => res !== null)
          .map(res => res!.data);

        setHistoryVideos(validVideos);
      } catch (error) {
        console.error("Ошибка при парсинге/загрузке истории:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка истории...</div>;
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>История просмотров</h1>
      
      {historyVideos.length === 0 ? (
        <p>Вы еще не посмотрели ни одного видео.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {historyVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
