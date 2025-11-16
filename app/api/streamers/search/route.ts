import { NextRequest, NextResponse } from 'next/server';

interface StreamerResult {
  id: string;
  username: string;
  displayName: string;
  platform: 'twitch' | 'youtube' | 'kick';
  avatarUrl: string;
  isLive: boolean;
  currentViewers: number;
  currentTitle?: string;
  url: string;
}

// Mock data - Streamers brasileiros populares
const MOCK_STREAMERS: StreamerResult[] = [
  // Twitch
  {
    id: 'twitch-gaules',
    username: 'gaules',
    displayName: 'Gaules',
    platform: 'twitch',
    avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/f04b2a14-8b63-4ccf-8a1e-7fc09974aa97-profile_image-300x300.png',
    isLive: true,
    currentViewers: 45200,
    currentTitle: 'CS2 - Major Playoffs • Drops ON',
    url: 'https://twitch.tv/gaules',
  },
  {
    id: 'twitch-nobru',
    username: 'nobru',
    displayName: 'Nobru',
    platform: 'twitch',
    avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/50b98453-4e1d-4548-9b0c-f633c2a63945-profile_image-300x300.png',
    isLive: true,
    currentViewers: 12800,
    currentTitle: 'Valorant - Ranked com os amigos',
    url: 'https://twitch.tv/nobru',
  },
  {
    id: 'twitch-loud_coringa',
    username: 'loud_coringa',
    displayName: 'LOUD Coringa',
    platform: 'twitch',
    avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/1c5ab18c-8c0f-4f4d-9c4c-8c4c8c4c8c4c-profile_image-300x300.png',
    isLive: true,
    currentViewers: 8500,
    currentTitle: 'CS2 - Praticando para o Major',
    url: 'https://twitch.tv/loud_coringa',
  },
  {
    id: 'twitch-yoda',
    username: 'yoda',
    displayName: 'yoda',
    platform: 'twitch',
    avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/yoda-profile_image-300x300.png',
    isLive: true,
    currentViewers: 6200,
    currentTitle: 'LoL - Solo Queue',
    url: 'https://twitch.tv/yoda',
  },
  {
    id: 'twitch-fallen',
    username: 'fallen',
    displayName: 'FalleN',
    platform: 'twitch',
    avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/fallen-profile_image-300x300.png',
    isLive: false,
    currentViewers: 0,
    currentTitle: '',
    url: 'https://twitch.tv/fallen',
  },

  // YouTube
  {
    id: 'youtube-gaules',
    username: 'gaules',
    displayName: 'Gaules',
    platform: 'youtube',
    avatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kGaules-yt-avatar',
    isLive: false,
    currentViewers: 0,
    currentTitle: '',
    url: 'https://youtube.com/@gaules',
  },
  {
    id: 'youtube-nobru',
    username: 'nobru',
    displayName: 'Nobru',
    platform: 'youtube',
    avatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kNobru-yt-avatar',
    isLive: true,
    currentViewers: 3500,
    currentTitle: 'Valorant ao vivo - Ranked',
    url: 'https://youtube.com/@nobru',
  },

  // Kick
  {
    id: 'kick-gaules',
    username: 'gaules',
    displayName: 'Gaules',
    platform: 'kick',
    avatarUrl: 'https://kick.com/gaules-avatar.png',
    isLive: false,
    currentViewers: 0,
    currentTitle: '',
    url: 'https://kick.com/gaules',
  },
  {
    id: 'kick-loud',
    username: 'loud',
    displayName: 'LOUD',
    platform: 'kick',
    avatarUrl: 'https://kick.com/loud-avatar.png',
    isLive: true,
    currentViewers: 2100,
    currentTitle: 'CS2 - Treino da equipe',
    url: 'https://kick.com/loud',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';

  // Se não tiver query, retorna os mais populares ao vivo
  if (!query || query.length < 2) {
    const popular = MOCK_STREAMERS
      .filter(s => s.isLive)
      .sort((a, b) => b.currentViewers - a.currentViewers)
      .slice(0, 8);

    return NextResponse.json({
      results: popular,
      total: popular.length,
      query: '',
    });
  }

  // Busca nas 3 plataformas simultaneamente
  const results = MOCK_STREAMERS.filter(streamer =>
    streamer.username.toLowerCase().includes(query) ||
    streamer.displayName.toLowerCase().includes(query)
  );

  // Ordena por: Live primeiro, depois por viewers
  const sorted = results.sort((a, b) => {
    // Prioridade 1: Live vs Offline
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;

    // Prioridade 2: Viewers (se ambos live ou ambos offline)
    return b.currentViewers - a.currentViewers;
  });

  return NextResponse.json({
    results: sorted,
    total: sorted.length,
    query,
  });
}
