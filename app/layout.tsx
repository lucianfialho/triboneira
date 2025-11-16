import type { Metadata } from 'next';
import './globals.css';
import { Amplitude } from '@/amplitude';

export const metadata: Metadata = {
  title: 'Entrega Newba - Multistream',
  description: 'Assista múltiplas lives de Twitch, YouTube e Kick simultaneamente. Do newba ao pro, suas streams em um só lugar.',
  keywords: ['multistream', 'twitch', 'youtube', 'kick', 'streaming', 'cs', 'counter-strike', 'entrega newba'],
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
