'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { videoApi, commentApi, Video, Comment } from '@/services/apiClient';
import VideoPlayer from '@/components/VideoPlayer';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import styles from './video.module.css';

// Mock video for demonstration
const MOCK_VIDEO: Video = {
  id: '1',
  title: 'Getting Started with Next.js 14 — Full Course',
  description: 'In this comprehensive tutorial, we cover everything you need to know about Next.js 14, including the App Router, Server Components, data fetching patterns, and deploying your application to production.\n\nTopics covered:\n• App Router and layout system\n• Server vs Client components\n• Data fetching with async/await\n• Routing and navigation\n• API Routes',
  url: '',
  thumbnailUrl: '',
  views: 1_240_000,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  user: { id: 'u1', username: 'CodeMaster', avatarUrl: '' },
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  const fetchVideo = async () => {
    try {
      const { data } = await videoApi.getById(id);
      setVideo(data);
    } catch {
      setVideo(MOCK_VIDEO);
    } finally {
      setVideoLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await commentApi.getByVideoId(id);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [id]);

  if (videoLoading) {
    return <div className={styles.center}><div className="spinner" /></div>;
  }

  if (!video) {
    return <div className={styles.center}><p>Video not found.</p></div>;
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        {/* Main column */}
        <div className={styles.main}>
          <VideoPlayer src={video.url} title={video.title} />

          <div className={styles.videoInfo}>
            <h1 className={styles.title}>{video.title}</h1>
            <div className={styles.metaRow}>
              <div className={styles.channelInfo}>
                <div className={styles.avatar}>
                  {video.user.username?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className={styles.channelName}>{video.user.username}</p>
                </div>
              </div>
              <div className={styles.stats}>
                <span>{formatViews(video.views)} views</span>
                <span className={styles.dot}>·</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>

            {video.description && (
              <div className={`${styles.description} ${descExpanded ? styles.expanded : ''}`}>
                <p>{video.description}</p>
                {!descExpanded && (
                  <button
                    className={styles.showMore}
                    onClick={() => setDescExpanded(true)}
                  >
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className={styles.comments}>
            <h2 className={styles.commentsHeading}>
              {comments.length} Comments
            </h2>
            <CommentForm videoId={id} onCommentAdded={fetchComments} />
            <div className={styles.commentList}>
              <CommentList comments={comments} />
            </div>
          </div>
        </div>

        {/* Sidebar placeholder */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Up next</p>
          <p className={styles.sidebarSub}>More videos will appear here once the backend is connected.</p>
        </aside>
      </div>
    </div>
  );
}
