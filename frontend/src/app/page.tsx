'use client';

import { useEffect, useState } from 'react';
import { videoApi, Video } from '@/services/apiClient';
import VideoCard from '@/components/VideoCard';
import styles from './page.module.css';

// Mock data for when backend is not available
const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 14 — Full Course',
    description: 'Learn everything about Next.js App Router',
    url: '',
    thumbnailUrl: '',
    views: 1_240_000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    user: { id: 'u1', username: 'CodeMaster', avatarUrl: '' },
  },
  {
    id: '2',
    title: 'TypeScript Advanced Patterns You Must Know',
    description: 'Deep dive into TypeScript generics and utility types',
    url: '',
    thumbnailUrl: '',
    views: 578_000,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    user: { id: 'u2', username: 'TSGuru', avatarUrl: '' },
  },
  {
    id: '3',
    title: 'Building a REST API with Express and PostgreSQL',
    description: 'Full backend tutorial with Prisma ORM',
    url: '',
    thumbnailUrl: '',
    views: 923_500,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    user: { id: 'u3', username: 'BackendDev', avatarUrl: '' },
  },
  {
    id: '4',
    title: 'React Hooks Deep Dive — useState, useEffect & more',
    description: 'Mastering React hooks from scratch',
    url: '',
    thumbnailUrl: '',
    views: 2_100_000,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    user: { id: 'u4', username: 'ReactPro', avatarUrl: '' },
  },
  {
    id: '5',
    title: 'Docker for Developers — Containers Made Easy',
    description: 'Containerize your apps like a pro',
    url: '',
    thumbnailUrl: '',
    views: 440_000,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    user: { id: 'u5', username: 'DevOpsWizard', avatarUrl: '' },
  },
  {
    id: '6',
    title: 'CSS Grid & Flexbox — Complete Layout Guide',
    description: 'Modern CSS layout techniques',
    url: '',
    thumbnailUrl: '',
    views: 310_000,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    user: { id: 'u6', username: 'CSSArtist', avatarUrl: '' },
  },
  {
    id: '7',
    title: 'Intro to Prisma ORM — Type-safe Database Queries',
    description: 'Modern database access with Prisma',
    url: '',
    thumbnailUrl: '',
    views: 267_000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    user: { id: 'u7', username: 'DBNinja', avatarUrl: '' },
  },
  {
    id: '8',
    title: 'Authentication with JWT — A Complete Guide',
    description: 'Secure your API with JSON Web Tokens',
    url: '',
    thumbnailUrl: '',
    views: 890_000,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    user: { id: 'u8', username: 'SecureCode', avatarUrl: '' },
  },
];

const CATEGORIES = ['All', 'Development', 'Design', 'DevOps', 'Databases', 'Security'];

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    videoApi.getAll()
      .then(({ data }) => setVideos(data))
      .catch(() => setVideos(MOCK_VIDEOS))
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
