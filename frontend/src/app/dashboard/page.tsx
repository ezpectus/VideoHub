'use client';

//так само поки тест бекенду а потім зміна розміру с css у %
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { videoApi, Video } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // state for edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await videoApi.getMyVideos();
        setVideos(data);
      } catch (error) {
        console.error("Ошибка загрузки ваших видео:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyVideos();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это видео навсегда?')) return;
    
    try {
      await videoApi.delete(id);
      // optical removal
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      alert("Не удалось удалить видео. Возможно, нет прав или проблема с сервером.");
    }
  };

  const startEdit = (video: Video) => {
    setEditingId(video.id);
    setEditTitle(video.title);
  };

  const saveEdit = async (id: string) => {
    try {
      await videoApi.update(id, { title: editTitle });
      
      setVideos(videos.map(v => v.id === id ? { ...v, title: editTitle } : v));
      setEditingId(null);
    } catch (error) {
      alert("Не удалось сохранить изменения.");
    }
  };

  if (isAuthLoading || loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Загрузка...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Управление контентом (Мои видео)</h1>
      
      {videos.length === 0 ? (
        <p>У вас пока нет загруженных видео.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {videos.map(video => (
            <div key={video.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
              
              {/*name and editing*/}
              <div style={{ flex: 1, marginRight: '20px' }}>
                {editingId === video.id ? (
                  <input 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #555' }}
                  />
                ) : (
                  <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => router.push(`/video/${video.id}`)}>
                    {video.title}
                  </h3>
                )}
                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#aaa' }}>Просмотров: {video.views}</p>
              </div>

              {/* control buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {editingId === video.id ? (
                  <button onClick={() => saveEdit(video.id)} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Сохранить</button>
                ) : (
                  <button onClick={() => startEdit(video)} style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Изменить</button>
                )}
                <button onClick={() => handleDelete(video.id)} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Удалить</button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
