import type { Metadata } from 'next';
import './globals.css';
import { Amplitude } from '@/amplitude';

export const metadata: Metadata = {
  metadataBase: new URL('https://entreganewba.com.br'),
  title: {
    default: 'Entrega Newba - Assista Múltiplas Lives Simultaneamente | Twitch, YouTube, Kick',
    template: '%s | Entrega Newba',
  },
  description: 'Assista múltiplas transmissões ao vivo simultaneamente de Twitch, YouTube e Kick. Layouts flexíveis, descoberta de streamers e controles individuais. Totalmente gratuito!',
  keywords: [
    'multistream',
    'multi stream',
    'twitch multistream',
    'youtube multistream',
    'kick multistream',
    'assistir várias lives',
    'múltiplas lives',
    'streaming',
    'live streaming',
    'twitch',
    'youtube live',
    'kick',
    'entrega newba',
    'multistream viewer',
    'split screen streaming',
  ],
  authors: [{ name: 'Entrega Newba' }],
  creator: 'Entrega Newba',
  publisher: 'Entrega Newba',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://entreganewba.com.br',
    siteName: 'Entrega Newba',
    title: 'Entrega Newba - Assista Múltiplas Lives Simultaneamente',
    description: 'Assista múltiplas transmissões ao vivo de Twitch, YouTube e Kick simultaneamente. Layouts flexíveis, descoberta de streamers e totalmente gratuito!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Entrega Newba - Multistream Viewer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrega Newba - Assista Múltiplas Lives Simultaneamente',
    description: 'Assista múltiplas transmissões ao vivo de Twitch, YouTube e Kick simultaneamente. Totalmente gratuito!',
    images: ['/og-image.png'],
    creator: '@entreganewba',
  },
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
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://entreganewba.com.br',
  },
  verification: {
    google: 'RTLPxCdxEWQ8a_W6vGX0WDHxxUAaIPwh_B2i_rwpnAo',
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
