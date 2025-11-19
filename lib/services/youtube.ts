/**
 * YouTube Data API v3 Integration Service
 * Docs: https://developers.google.com/youtube/v3/docs
 */

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeLiveStream {
  id: string;
  snippet: {
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  liveStreamingDetails?: {
    actualStartTime: string;
    concurrentViewers?: string;
  };
}

/**
 * Busca canais do YouTube por query
 */
export async function searchYouTubeChannels(query: string): Promise<YouTubeChannel[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: '10',
          key: apiKey,
        }),
      { next: { revalidate: 300 } } // Cache por 5 minutos
    );

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Buscar detalhes completos dos canais
    const channelIds = data.items.map((item: any) => item.id.channelId).join(',');
    const channelsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
        new URLSearchParams({
          part: 'snippet',
          id: channelIds,
          key: apiKey,
        })
    );

    if (!channelsResponse.ok) {
      return [];
    }

    const channelsData = await channelsResponse.json();
    return channelsData.items || [];
  } catch (error) {
    console.error('Error searching YouTube channels:', error);
    return [];
  }
}

/**
 * Verifica se um canal está ao vivo e retorna informações da live
 */
export async function getYouTubeLiveStream(channelId: string): Promise<YouTubeLiveStream | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          channelId: channelId,
          eventType: 'live',
          type: 'video',
          key: apiKey,
        })
    );

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const videoId = data.items[0].id.videoId;

    // Buscar detalhes da live incluindo viewers
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
        new URLSearchParams({
          part: 'snippet,liveStreamingDetails',
          id: videoId,
          key: apiKey,
        })
    );

    if (!videoResponse.ok) {
      return null;
    }

    const videoData = await videoResponse.json();
    return videoData.items?.[0] || null;
  } catch (error) {
    console.error('Error getting YouTube live stream:', error);
    return null;
  }
}

/**
 * Busca informações de um vídeo do YouTube por ID
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<YouTubeLiveStream | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
        new URLSearchParams({
          part: 'snippet,liveStreamingDetails',
          id: videoId,
          key: apiKey,
        }),
      { next: { revalidate: 30 } } // Cache por 30 segundos
    );

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    return data.items[0];
  } catch (error) {
    console.error('Error getting YouTube video info:', error);
    return null;
  }
}

/**
 * Busca canal do YouTube por handle/username
 */
export async function getYouTubeChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    // Tentar buscar por handle customizado
    let response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: handle,
          type: 'channel',
          maxResults: '1',
          key: apiKey,
        })
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const channelId = data.items[0].id.channelId;

    // Buscar detalhes completos do canal
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
        new URLSearchParams({
          part: 'snippet',
          id: channelId,
          key: apiKey,
        })
    );

    if (!channelResponse.ok) {
      return null;
    }

    const channelData = await channelResponse.json();
    return channelData.items?.[0] || null;
  } catch (error) {
    console.error('Error getting YouTube channel:', error);
    return null;
  }
}
