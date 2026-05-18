'use client';

import { useState } from 'react';
import { commentApi } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import styles from './CommentForm.module.css';

interface Props {
  videoId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ videoId, onCommentAdded }: Props) {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt}>
        <a href="/login" className="btn btn-secondary">Sign in to comment</a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      await commentApi.create(videoId, text.trim());
      setText('');
      onCommentAdded();
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="comment-form" className={styles.form} onSubmit={handleSubmit}>
      <textarea
        id="comment-input"
        className={`form-input ${styles.textarea}`}
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        disabled={loading}
        aria-label="Write a comment"
      />
      {error && <p className="error-msg">{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => { setText(''); setError(''); }}
          disabled={loading || !text}
        >
          Cancel
        </button>
        <button
          id="submit-comment-btn"
          type="submit"
          className="btn btn-primary"
          disabled={loading || !text.trim()}
        >
          {loading ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
