'use client';

import styles from './VideoPlayer.module.css';

interface Props {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: Props) {
  return (
    <div className={styles.playerWrapper}>
      <video
        id="video-player"
        className={styles.video}
        src={src}
        controls
        autoPlay={false}
        preload="metadata"
        aria-label={title ?? 'Video player'}
      >
        Your browser does not support the HTML5 video tag.
      </video>
    </div>
  );
}
