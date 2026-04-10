import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'VideoHub — Watch, Upload, Share',
  description: 'VideoHub is a full-featured video sharing platform. Upload your videos, discover content, and connect with creators.',
  keywords: ['video', 'streaming', 'upload', 'watch', 'share'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </body>
    </html>
  );
}
