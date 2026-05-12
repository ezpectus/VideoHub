import axios from 'axios';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bannerUrl?: string;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  isSubscribed?: boolean;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  views: number;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>;
  likesCount?: number; 
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Axios Instance ─────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
};

// ─── Video API ──────────────────────────────────────────────────────────────

export const videoApi = {
  getAll: () =>
    api.get<Video[]>('/videos'),

  getById: (id: string) =>
    api.get<Video>(`/videos/${id}`),

  getByUserId: (userId: string) =>
    api.get<Video[]>(`/videos?userId=${userId}`),

  getMyVideos: () =>
    api.get<Video[]>('/videos/my'),

  upload: (formData: FormData) =>
    api.post<Video>('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadByUrl: (data: { title: string; url: string; description?: string }) =>
    api.post<Video>('/videos/upload-by-url', data),

  toggleLike: (id: string) =>
    api.post<{ likesCount: number; isLiked: boolean }>(`/videos/${id}/like`),

  update: (id: string, data: { title?: string; description?: string }) =>
    api.patch<Video>(`/videos/${id}`, data),

  delete: (id: string) =>
    api.delete(`/videos/${id}`),
};

// ─── User API ──────────────────────────────────────────────────────────────

export const userApi = {
  getMe: () => api.get<User>('/users/me'),

  getById: (id: string) =>
    api.get<Pick<User, 'id' | 'username' | 'avatarUrl' | 'bannerUrl' | 'description' | 'createdAt' | 'subscriberCount' | 'videoCount' | 'isSubscribed'>>(`/users/${id}`),
};

// ─── Subscription API ────────────────────────────────────────────────────────

export const subscriptionApi = {
  toggle: (channelId: string) =>
    api.post<{ message: string }>(`/subscriptions/${channelId}/toggle`),
};

// ─── Comment API ─────────────────────────────────────────────────────────────

export const commentApi = {
  getByVideoId: (videoId: string) =>
    api.get<Comment[]>(`/videos/${videoId}/comments`),

  create: (videoId: string, text: string) =>
    api.post<Comment>(`/videos/${videoId}/comments`, { text }),
};

export default api;
