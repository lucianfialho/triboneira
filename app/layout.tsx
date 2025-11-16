import type { Metadata } from 'next';
import './globals.css';
import { Amplitude } from '@/amplitude';

export const metadata: Metadata = {
  title: 'Entrega Newba - Multistream',
  description: 'GG and have a good stream - Assista múltiplas lives de Twitch, YouTube e Kick simultaneamente.',
  keywords: ['multistream', 'twitch', 'youtube', 'kick', 'streaming', 'cs', 'counter-strike', 'entrega newba'],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <Amplitude />
      <body className="antialiased">{children}</body>
    </html>
  );
}
