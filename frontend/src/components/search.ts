interface Video {
  id: string;
  title: string;
  url: string;
  views: number;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

export async function fetchSearchResults(query: string): Promise<Video[]> {

  
  console.log("Looking for video on demand:", query);

  const mockVideos: Video[] = [
    {
      id: '1',
      title: `...: ${query}`,
      url: '/video-1',
      views: 1250,
      createdAt: '2024-05-20',
      user: { name: 'Admin', image: '' }
    },
    {
      id: '2',
      title: `...: ${query}`,
      url: '/video-2',
      views: 850,
      createdAt: '2024-05-21',
      user: { name: 'Developer', image: '' }
    }
  ];

  return mockVideos;
}