import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multistream - Watch Multiple Streams',
  description: 'Watch multiple Twitch, YouTube, and Kick streams simultaneously in perfect harmony.',
  keywords: ['multistream', 'twitch', 'youtube', 'kick', 'streaming', 'multiple streams'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
