'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { userApi, videoApi, Video, User } from '@/services/apiClient';
import VideoCard from '@/components/VideoCard';

export default function UserChannelPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [author, setAuthor] = useState<Partial<User> | null>(null);
  const [authorVideos, setAuthorVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const [userRes, videosRes] = await Promise.all([
          userApi.getById(userId),
          videoApi.getByUserId(userId)
        ]);

        setAuthor(userRes.data);
        setAuthorVideos(videosRes.data);
      } catch (error) {
        console.error("Error loading channel:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchChannelData();
  }, [userId]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading channel…</div>;
  }

  if (!author) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>User not found.</div>;
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', overflow: 'hidden' }}>
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            author.username?.[0]?.toUpperCase() ?? 'U'
          )}
        </div>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>{author.username}</h1>
          <p style={{ margin: 0, color: '#aaa' }}>{authorVideos.length} videos</p>
        </div>
      </div>

      {/* Video grid */}
      <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Uploaded videos</h2>

      {authorVideos.length === 0 ? (
        <p style={{ color: '#aaa' }}>This user hasn&apos;t uploaded any videos yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {authorVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
