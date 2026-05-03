'use client';

import { useEffect, useState } from 'react';
import { videoApi, Video } from '@/services/apiClient';
import VideoCard from '@/components/VideoCard';
import styles from './page.module.css';

const CATEGORIES = ['All', 'Development', 'Design', 'DevOps', 'Databases', 'Security'];

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    videoApi.getAll()
      .then(({ data }) => setVideos(data))
      .catch((error) => {
        console.error("Failed to fetch videos:", error);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      {/* Category chips */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`category-${cat.toLowerCase()}`}
            className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className="spinner" />
        </div>
      ) : (
        <section className={styles.grid} aria-label="Video feed">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </section>
      )}
    </div>
  );
}
