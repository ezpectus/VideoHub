'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { videoApi, commentApi, Video, Comment } from '@/services/apiClient';
import VideoPlayer from '@/components/VideoPlayer';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import styles from './video.module.css';


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
  const id = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const fetchVideo = async () => {
    try {
      const { data } = await videoApi.getById(id);
      setVideo(data);
      setLikes(data.likesCount || 0);
      setIsLiked(data.isLiked || false);
    } catch (error) {
      console.error("Failed to fetch video:", error);
      setVideo(null);
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

  // instant display of likes 
  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likes + 1 : likes - 1;
    
    setIsLiked(newIsLiked);
    setLikes(newLikesCount);

    try {
      // silently sends data to the server
      await videoApi.toggleLike(id);
    } catch (error) {
      console.error("Error while liking:", error);
      //in case of error
      setIsLiked(!newIsLiked);
      setLikes(likes);
    }
  };
  
  useEffect(() => {
    fetchVideo();
    fetchComments();
    if (id) {
      try {
        // Reading browser memory
        const storedHistory = localStorage.getItem('watchHistory');
        let historyArray: string[] = storedHistory ? JSON.parse(storedHistory) : [];

        // removing duplicaties
        historyArray = historyArray.filter(videoId => videoId !== id);
        
        // add to the beginning of the list
        historyArray.unshift(id);

        // the history limit 50
        if (historyArray.length > 50) {
          historyArray.pop();
        }

        // save to browser memory
        localStorage.setItem('watchHistory', JSON.stringify(historyArray));
      } catch (error) {
        console.error("Error saving watch history:", error);
      }
    }

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
              <Link href={`/user/${video.user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.channelInfo}>
                  <div className={styles.avatar}>
                    {video.user.username?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className={styles.channelName}>{video.user.username}</p>
                  </div>
                </div>
              </Link>
              
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
  <div className={styles.stats}>
    <span>{formatViews(video.views)} views</span>
    <span className={styles.dot}>·</span>
    <span>{formatDate(video.createdAt)}</span>
  </div>

  <button 
    onClick={handleLike}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 16px', borderRadius: '20px',
      border: '1px solid #ccc',
      backgroundColor: isLiked ? '#e5e5e5' : '#f2f2f2',
      cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
    }}
  >
    <svg 
      width="20" height="20" viewBox="0 0 24 24" 
      fill={isLiked ? "currentColor" : "none"} 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
    {formatViews(likes)}
  </button>
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