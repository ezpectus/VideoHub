'use client';

import Link from 'next/link';
import { Video } from '@/services/apiClient';
import styles from './VideoCard.module.css';

interface Props {
  video: Video;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  return `${Math.floor(months / 12)} years ago`;
}

export default function VideoCard({ video }: Props) {
  return (
    <Link href={`/video/${video.id}`} className={styles.card} id={`video-card-${video.id}`}>
      <div className={styles.thumbnail}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className={styles.thumbnailImg} />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        )}
        <div className={styles.overlay} />
      </div>

      <div className={styles.info}>
        <div className={styles.avatarSmall}>
          {video.user.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className={styles.meta}>
          <h3 className={styles.title}>{video.title}</h3>
          <p className={styles.channel}>{video.user.username}</p>
          <p className={styles.stats}>
            {formatViews(video.views)} · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
