import { NextRequest, NextResponse } from 'next/server';
import { searchTwitchUsers, getTwitchStream, getTwitchUser, getTopLiveStreams } from '@/lib/services/twitch';
import { searchYouTubeChannels, getYouTubeLiveStream } from '@/lib/services/youtube';
import { getKickChannel, searchKickUsers, getKickFeaturedStreams } from '@/lib/services/kick';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';

  // Se não tiver query, retornar top streamers ao vivo
  if (!query || query.length < 2) {
    try {
      // Buscar em paralelo Twitch e Kick
      const [twitchStreamers, kickStreamers] = await Promise.allSettled([
        getTopLiveStreamsFormatted(),
        getKickFeaturedStreamsFormatted(),
      ]);

      const allStreamers = [
        ...(twitchStreamers.status === 'fulfilled' ? twitchStreamers.value : []),
        ...(kickStreamers.status === 'fulfilled' ? kickStreamers.value : []),
      ];

      // Ordenar por viewers
      const sorted = allStreamers.sort((a, b) => b.currentViewers - a.currentViewers);

      return NextResponse.json({
        results: sorted.slice(0, 15), // Limitar a 15 resultados
        total: sorted.length,
        query: '',
      });
    } catch (error) {
      console.error('Error fetching top streamers:', error);
      return NextResponse.json({
        results: [],
        total: 0,
        query: '',
      });
    }
  }

  try {
    // Buscar nas 3 plataformas em paralelo
    const [twitchResults, youtubeResults, kickResults] = await Promise.allSettled([
      searchTwitchFromAPI(query),
      searchYouTubeFromAPI(query),
      searchKickFromAPI(query),
    ]);

    const allResults: StreamerResult[] = [
      ...(twitchResults.status === 'fulfilled' ? twitchResults.value : []),
      ...(youtubeResults.status === 'fulfilled' ? youtubeResults.value : []),
      ...(kickResults.status === 'fulfilled' ? kickResults.value : []),
    ];

    // Ordena por: Live primeiro, depois por viewers
    const sorted = allResults.sort((a, b) => {
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
  } catch (error) {
    console.error('Error searching streamers:', error);
    return NextResponse.json(
      {
        results: [],
        total: 0,
        query,
        error: 'Failed to search streamers',
      },
      { status: 500 }
    );
  }
}

/**
 * Obtém os top streamers ao vivo formatados
 */
async function getTopLiveStreamsFormatted(): Promise<StreamerResult[]> {
  try {
    // Buscar streamers brasileiros (pt) - mais relevante para o público
    const streams = await getTopLiveStreams(10, 'pt');
    const results: StreamerResult[] = [];

    for (const stream of streams) {
      results.push({
        id: `twitch-${stream.user_id}`,
        username: stream.user_login,
        displayName: stream.user_name,
        platform: 'twitch',
        avatarUrl: stream.thumbnail_url.replace('{width}', '300').replace('{height}', '300'),
        isLive: true,
        currentViewers: stream.viewer_count,
        currentTitle: stream.title,
        url: `https://twitch.tv/${stream.user_login}`,
      });
    }

    return results;
  } catch (error) {
    console.error('Error getting top live streams:', error);
    return [];
  }
}

/**
 * Busca streamers na Twitch
 */
async function searchTwitchFromAPI(query: string): Promise<StreamerResult[]> {
  try {
    const channels = await searchTwitchUsers(query);
    const results: StreamerResult[] = [];

    // Limitar a 5 resultados por plataforma para não sobrecarregar
    const limitedChannels = channels.slice(0, 5);

    for (const channel of limitedChannels) {
      let viewerCount = 0;

      // Se está ao vivo, buscar o número de viewers
      if (channel.is_live) {
        const stream = await getTwitchStream(channel.broadcaster_login);
        viewerCount = stream?.viewer_count || 0;
      }

      results.push({
        id: `twitch-${channel.id}`,
        username: channel.broadcaster_login,
        displayName: channel.display_name,
        platform: 'twitch',
        avatarUrl: channel.thumbnail_url,
        isLive: channel.is_live,
        currentViewers: viewerCount,
        currentTitle: channel.title || '',
        url: `https://twitch.tv/${channel.broadcaster_login}`,
      });
    }

    return results;
  } catch (error) {
    console.error('Error searching Twitch:', error);
    return [];
  }
}

/**
 * Busca canais no YouTube
 */
async function searchYouTubeFromAPI(query: string): Promise<StreamerResult[]> {
  try {
    const channels = await searchYouTubeChannels(query);
    const results: StreamerResult[] = [];

    // Limitar a 5 resultados
    const limitedChannels = channels.slice(0, 5);

    for (const channel of limitedChannels) {
      // Verificar se está ao vivo
      const liveStream = await getYouTubeLiveStream(channel.id);

      const username = channel.snippet.customUrl?.replace('@', '') || channel.id;

      results.push({
        id: `youtube-${channel.id}`,
        username: username,
        displayName: channel.snippet.title,
        platform: 'youtube',
        avatarUrl: channel.snippet.thumbnails.high.url,
        isLive: liveStream !== null,
        currentViewers: liveStream?.liveStreamingDetails?.concurrentViewers
          ? parseInt(liveStream.liveStreamingDetails.concurrentViewers)
          : 0,
        currentTitle: liveStream?.snippet.title || '',
        url: `https://youtube.com/${channel.snippet.customUrl || `channel/${channel.id}`}`,
      });
    }

    return results;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

/**
 * Obtém streamers em destaque do Kick formatados
 */
async function getKickFeaturedStreamsFormatted(): Promise<StreamerResult[]> {
  try {
    const channels = await getKickFeaturedStreams();
    const results: StreamerResult[] = [];

    for (const channel of channels.slice(0, 5)) {
      // Apenas incluir se estiver ao vivo
      if (channel.livestream?.is_live) {
        // Prioridade: thumbnail da live > banner > profile_pic > gerado
        const avatarUrl =
          channel.livestream.thumbnail?.src ||
          channel.banner_picture ||
          channel.user.profile_pic ||
          `https://ui-avatars.com/api/?name=${channel.user.username}&background=random`;

        results.push({
          id: `kick-${channel.id}`,
          username: channel.slug,
          displayName: channel.user.username,
          platform: 'kick',
          avatarUrl: avatarUrl,
          isLive: true,
          currentViewers: channel.livestream.viewer_count || 0,
          currentTitle: channel.livestream.session_title || '',
          url: `https://kick.com/${channel.slug}`,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error getting Kick featured streams:', error);
    return [];
  }
}

/**
 * Busca canal no Kick
 */
async function searchKickFromAPI(query: string): Promise<StreamerResult[]> {
  try {
    // Kick só permite busca por username exato (sem endpoint de search)
    const channel = await getKickChannel(query);

    if (!channel) {
      return [];
    }

    // Prioridade para avatar: thumbnail da live > banner > profile_pic > gerado
    const avatarUrl =
      (channel.livestream?.is_live && channel.livestream?.thumbnail?.src) ||
      channel.banner_picture ||
      channel.user.profile_pic ||
      `https://ui-avatars.com/api/?name=${channel.user.username}&background=random`;

    return [
      {
        id: `kick-${channel.id}`,
        username: channel.slug,
        displayName: channel.user.username,
        platform: 'kick',
        avatarUrl: avatarUrl,
        isLive: channel.livestream?.is_live || false,
        currentViewers: channel.livestream?.viewer_count || 0,
        currentTitle: channel.livestream?.session_title || '',
        url: `https://kick.com/${channel.slug}`,
      },
    ];
  } catch (error) {
    console.error('Error searching Kick:', error);
    return [];
  }
}
