'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type ReactPlayerType from 'react-player';
import styles from './VideoPlayer.module.css';

// react-player accesses `window` at import time, so we must
// load it lazily on the client only via Next.js dynamic().
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface Props {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: Props) {
  const playerRef = useRef<ReactPlayerType | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);       // 0-1 fraction
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [ready, setReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── helpers ──────────────────────────────────── */

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const currentTime = duration * played;

  /* ── auto-hide controls ──────────────────────── */

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  const handleMouseMove = () => scheduleHide();
  const handleMouseLeave = () => {
    if (playing) setShowControls(false);
  };

  /* ── seek bar handlers ───────────────────────── */

  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      const newTime = parseFloat((e.target as HTMLInputElement).value) * duration;
      playerRef.current.currentTime = newTime;
    }
  };

  /* ── fullscreen ──────────────────────────────── */

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapperRef.current.requestFullscreen();
    }
  };

  /* ── play / pause overlay click ──────────────── */

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p;
      if (playerRef.current) {
        if (next) playerRef.current.play();
        else playerRef.current.pause();
      }
      return next;
    });
  };

  /* ── volume ──────────────────────────────────── */

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(v === 0);
  };

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  /* ── skip ±10s ───────────────────────────────── */

  const skip = (secs: number) => {
    const targetTime = Math.min(Math.max(currentTime + secs, 0), duration);
    if (playerRef.current) {
      playerRef.current.currentTime = targetTime;
    }
    if (duration > 0) setPlayed(targetTime / duration);
  };

  /* ── keyboard shortcuts ──────────────────────── */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        skip(-10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        skip(10);
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
    scheduleHide();
  };

  const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');

  /* ── render ──────────────────────────────────── */

  return (
    <div
      ref={wrapperRef}
      className={styles.playerWrapper}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label={title ?? 'Video player'}
    >
      {/* Underlying react-player */}
      <ReactPlayer
        ref={(r: any) => { playerRef.current = r; }}
        className={styles.reactPlayer}
        src={src}
        autoPlay={playing}
        muted={muted}
        width="100%"
        height="100%"
        controls={isYouTube}
        onLoadedData={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onDurationChange={(e: any) => setDuration(e.target.duration)}
        onTimeUpdate={(e: any) => {
          if (!seeking && duration > 0) {
            setPlayed(e.target.currentTime / duration);
          }
        }}
        onProgress={(e: any) => {
          // If buffered is available, we could calculate loaded amount here.
          // For now, simplify or keep it to 1.
          if (e.target.buffered?.length > 0) {
            setLoaded(e.target.buffered.end(e.target.buffered.length - 1) / duration);
          }
        }}
        config={{
          file: {
            attributes: { crossOrigin: 'anonymous' },
          },
          youtube: {
            playerVars: { showinfo: 1 },
          }
        }}
      />

      {/* Show custom controls only if NOT YouTube */}
      {!isYouTube && (
        <>
          {/* Big centre play button (shown when paused) */}
          {ready && !playing && (
            <button
              className={styles.bigPlayBtn}
              onClick={togglePlay}
              aria-label="Play video"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          {/* Click-to-play overlay */}
          <div className={styles.clickOverlay} onClick={togglePlay} />

          {/* Custom controls bar */}
          <div className={`${styles.controls} ${showControls ? styles.visible : ''}`}>
        {/* Progress / seek bar */}
        <div className={styles.progressRow}>
          {/* Loaded buffer */}
          <div className={styles.bufferBar} style={{ width: `${loaded * 100}%` }} />
          {/* Played bar */}
          <div className={styles.playedBar} style={{ width: `${played * 100}%` }} />
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            className={styles.seekSlider}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            aria-label="Seek"
          />
        </div>

        <div className={styles.controlsRow}>
          {/* Play / Pause */}
          <button className={styles.ctrlBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip backward 10s */}
          <button className={styles.ctrlBtn} onClick={() => skip(-10)} aria-label="Rewind 10 seconds">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12.5 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7h-2c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5V13l4-4.5L12.5 4v4z" />
              <text x="9" y="17.5" fontSize="7" fontWeight="bold" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Skip forward 10s */}
          <button className={styles.ctrlBtn} onClick={() => skip(10)} aria-label="Forward 10 seconds">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M11.5 8c4 0 7 3 7 7s-3 7-7 7-7-3-7-7h2c0 2.8 2.2 5 5 5s5-2.2 5-5-2.2-5-5-5V13l-4-4.5L11.5 4v4z" />
              <text x="8" y="17.5" fontSize="7" fontWeight="bold" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Volume */}
          <div className={styles.volumeGroup}>
            <button className={styles.ctrlBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v1.5l2.3 2.3c.1-.3.2-.5.2-.8zM19 12c0 1-.3 2-.7 2.8l1.5 1.5c.7-1.2 1.2-2.7 1.2-4.3 0-4.3-3-7.8-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.2 4.2c-.7.5-1.4.9-2.2 1.1v2.1c1.4-.3 2.6-1 3.7-1.8l2 2L21 20.3l-1-1L4.3 3zM12 4l-2.1 2.1L12 8.2V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8c1.5-.7 2.5-2.2 2.5-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8c1.5-.7 2.5-2.2 2.5-4zM14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.9-7-8.8z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volume"
            />
          </div>

          {/* Timestamp */}
          <span className={styles.time}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <span className={styles.spacer} />

          {/* Fullscreen */}
          <button className={styles.ctrlBtn} onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
