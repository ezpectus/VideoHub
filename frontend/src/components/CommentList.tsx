'use client';

import { Comment } from '@/services/apiClient';
import styles from './CommentList.module.css';

interface Props {
  comments: Comment[];
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
  return months < 12 ? `${months} months ago` : `${Math.floor(months / 12)} years ago`;
}

export default function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No comments yet. Be the first!</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {comments.map((c) => (
        <li key={c.id} className={styles.comment}>
          <div className={styles.avatar}>{c.user.username?.[0]?.toUpperCase() ?? 'U'}</div>
          <div className={styles.body}>
            <div className={styles.header}>
              <span className={styles.username}>{c.user.username}</span>
              <span className={styles.time}>{timeAgo(c.createdAt)}</span>
            </div>
            <p className={styles.text}>{c.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
