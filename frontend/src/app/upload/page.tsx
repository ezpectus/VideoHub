'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { videoApi } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import styles from './upload.module.css';

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) {
    return <div className={styles.center}><div className="spinner" /></div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith('video/')) setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (sourceType === 'file' && !file) return;
    if (sourceType === 'youtube' && !youtubeUrl.trim()) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);

      let data;
      if (sourceType === 'file') {
        const formData = new FormData();
        formData.append('file', file as File);
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        ({ data } = await videoApi.upload(formData));
      } else {
        ({ data } = await videoApi.uploadByUrl({
          title: title.trim(),
          url: youtubeUrl.trim(),
          description: description.trim() || undefined,
        }));
      }

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => router.push(`/video/${data.id}`), 500);
    } catch {
      setError('Upload failed. Please check your file and try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.heading}>Upload video</h1>

      <div className={styles.layout}>
        {sourceType === 'file' ? (
          <div
            id="drop-zone"
            className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload video file"
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              id="video-file-input"
              type="file"
              accept="video/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
            {file ? (
              <div className={styles.fileInfo}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className={styles.dropContent}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p className={styles.dropTitle}>Drag &amp; drop your video here</p>
                <p className={styles.dropSub}>or click to browse • MP4, MOV, AVI, WebM</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.dropZone}>
            <div className={styles.dropContent}>
              <p className={styles.dropTitle}>YouTube preview</p>
              {youtubeUrl.trim() ? (
                <iframe
                  width="100%"
                  height="260"
                  src={youtubeUrl.replace('watch?v=', 'embed/')}
                  title="YouTube video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 0, borderRadius: 12 }}
                />
              ) : (
                <p className={styles.dropSub}>Paste YouTube URL to preview player here</p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form id="upload-form" className={styles.form} onSubmit={handleSubmit}>
          {error && <p className="error-msg">{error}</p>}

          <div className="form-group">
            <label className="form-label">Source</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="file"
                  checked={sourceType === 'file'}
                  onChange={() => setSourceType('file')}
                />{' '}
                Upload file
              </label>
              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="youtube"
                  checked={sourceType === 'youtube'}
                  onChange={() => setSourceType('youtube')}
                />{' '}
                YouTube URL
              </label>
            </div>
          </div>

          {sourceType === 'youtube' && (
            <div className="form-group">
              <label className="form-label" htmlFor="youtube-url">YouTube link</label>
              <input
                id="youtube-url"
                type="url"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="video-title">Title <span style={{color:'var(--accent)'}}>*</span></label>
            <input
              id="video-title"
              type="text"
              className="form-input"
              placeholder="Give your video a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            <span className={styles.charCount}>{title.length}/100</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video-description">Description</label>
            <textarea
              id="video-description"
              className="form-input"
              placeholder="Tell viewers about your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
            />
          </div>

          {uploading && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          )}

          <button
            id="upload-submit-btn"
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={
              uploading ||
              !title.trim() ||
              (sourceType === 'file' && !file) ||
              (sourceType === 'youtube' && !youtubeUrl.trim())
            }
          >
            {uploading ? `Uploading ${progress}%…` : 'Upload video'}
          </button>
        </form>
      </div>
    </div>
  );
}
