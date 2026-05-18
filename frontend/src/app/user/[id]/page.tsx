'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi, videoApi, subscriptionApi, Video, User } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import VideoCard from '@/components/VideoCard';
import styles from './channel.module.css';

type Tab = 'home' | 'videos' | 'about';

export default function UserChannelPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [channel, setChannel] = useState<Partial<User> | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const [userRes, videosRes] = await Promise.all([
          userApi.getById(userId),
          videoApi.getByUserId(userId)
        ]);

        setChannel(userRes.data);
        setVideos(videosRes.data);
      } catch (error) {
        console.error("Error loading channel:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchChannelData();
  }, [userId, isAuthenticated]); // Re-fetch if auth changes to get updated isSubscribed

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!channel || isSubscribing) return;

    setIsSubscribing(true);
    try {
      await subscriptionApi.toggle(channel.id!);
      setChannel(prev => {
        if (!prev) return prev;
        const currentlySubscribed = prev.isSubscribed;
        return {
          ...prev,
          isSubscribed: !currentlySubscribed,
          subscriberCount: (prev.subscriberCount || 0) + (currentlySubscribed ? -1 : 1)
        };
      });
    } catch (err) {
      console.error('Failed to toggle subscription', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading channel…</div>;
  }

  if (!channel) {
    return <div className={styles.loading}>Channel not found.</div>;
  }

  const isOwnChannel = currentUser?.id === channel.id;

  return (
    <div className={styles.channelPage}>
      {/* Banner */}
      <div className={styles.banner}>
        {channel.bannerUrl ? (
          <img src={channel.bannerUrl} alt="Channel Banner" className={styles.bannerImg} />
        ) : (
           <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)' }} />
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {channel.avatarUrl ? (
            <img src={channel.avatarUrl} alt={channel.username} className={styles.avatarImg} />
          ) : (
            channel.username?.[0]?.toUpperCase() ?? 'U'
          )}
        </div>
        
        <div className={styles.info}>
          <h1 className={styles.name}>{channel.username}</h1>
          <p className={styles.stats}>
            @{channel.username?.toLowerCase().replace(/\s+/g, '')} ‧ {channel.subscriberCount || 0} subscribers ‧ {channel.videoCount || videos.length} videos
          </p>
          {channel.description && (
            <p className={styles.description}>{channel.description}</p>
          )}
          
          <div className={styles.actions}>
            {isOwnChannel ? (
              <button className={styles.subscribeBtn} onClick={() => alert('Customize channel (coming soon)')}>
                Customize channel
              </button>
            ) : (
              <button 
                className={channel.isSubscribed ? styles.subscribedBtn : styles.subscribeBtn}
                onClick={handleSubscribe}
                disabled={isSubscribing}
              >
                {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'home' ? styles.active : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'about' ? styles.active : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {(activeTab === 'home' || activeTab === 'videos') && (
          <>
            {videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p>This channel has no videos.</p>
              </div>
            ) : (
              <div className={styles.videoGrid}>
                {videos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'about' && (
          <div className={styles.aboutSection}>
            <h2 className={styles.aboutTitle}>Description</h2>
            <p className={styles.aboutText}>
              {channel.description || 'This channel does not have a description yet.'}
            </p>
            
            <h2 className={styles.aboutTitle} style={{ marginTop: '32px' }}>Details</h2>
            <p className={styles.aboutText}>
              Joined {new Date(channel.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
