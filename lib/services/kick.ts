/**
 * Kick API Integration Service
 * Docs: https://docs.kick.com/
 * OAuth 2.1 com App Access Token (Client Credentials)
 * API Base: https://api.kick.com/public/v1
 */

interface KickTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Nova interface para API oficial
interface KickChannelResponse {
  data: Array<{
    broadcaster_user_id: string;
    slug: string;
    channel_description: string;
    stream_title: string;
    stream: {
      is_live: boolean;
      viewer_count: number;
      thumbnail: string; // URL da thumbnail (string, não objeto)
    } | null;
    category: {
      id: string;
      name: string;
    } | null;
    banner_picture: string | null;
  }>;
  message: string;
}

// Interface mantida para compatibilidade com código existente
interface KickUser {
  id: number;
  username: string;
  slug: string;
  profile_pic?: string;
  bio?: string;
  verified: boolean;
}

interface KickChannel {
  id: number;
  user_id: number;
  slug: string;
  is_banned: boolean;
  playback_url: string;
  banner_picture: string | null;
  user: KickUser;
  livestream?: {
    id: number;
    slug: string;
    channel_id: number;
    created_at: string;
    session_title: string;
    is_live: boolean;
    viewer_count: number;
    thumbnail: {
      src: string;
    };
  } | null;
}

let cachedKickToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtém token de acesso da Kick API (App Access Token)
 * OAuth 2.1 Client Credentials Flow
 */
async function getKickToken(): Promise<string> {
  // Verifica se já temos um token válido em cache
  if (cachedKickToken && cachedKickToken.expiresAt > Date.now()) {
    return cachedKickToken.token;
  }

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Kick API credentials not configured');
  }

  // OAuth endpoint correto: https://id.kick.com (não kick.com)
  // Content-Type: application/x-www-form-urlencoded
  const response = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Kick token: ${response.statusText} - ${errorText}`);
  }

  const data: KickTokenResponse = await response.json();

  // Cache do token (expires_in - 5 minutos de margem)
  cachedKickToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

/**
 * Busca canal do Kick por username usando API oficial
 * API Endpoint: https://api.kick.com/public/v1/channels?slug={username}
 */
export async function getKickChannel(username: string): Promise<KickChannel | null> {
  try {
    const token = await getKickToken();
    const response = await fetch(
      `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(username)}`,
      {
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 }, // Cache por 1 minuto
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Kick API error:', response.status, await response.text());
      return null;
    }

    const result: KickChannelResponse = await response.json();

    // API retorna array, pegar primeiro resultado
    if (!result.data || result.data.length === 0) {
      return null;
    }

    const channel = result.data[0];

    // Converter para formato antigo para compatibilidade
    return {
      id: parseInt(channel.broadcaster_user_id),
      user_id: parseInt(channel.broadcaster_user_id),
      slug: channel.slug,
      is_banned: false,
      playback_url: `https://kick.com/${channel.slug}`,
      banner_picture: channel.banner_picture,
      user: {
        id: parseInt(channel.broadcaster_user_id),
        username: channel.slug,
        slug: channel.slug,
        verified: false,
      },
      livestream: channel.stream
        ? {
            id: 0,
            slug: channel.slug,
            channel_id: parseInt(channel.broadcaster_user_id),
            created_at: new Date().toISOString(),
            session_title: channel.stream_title || '',
            is_live: channel.stream.is_live,
            viewer_count: channel.stream.viewer_count,
            thumbnail: {
              src: channel.stream.thumbnail || '',
            },
          }
        : null,
    };
  } catch (error) {
    console.error('Error fetching Kick channel:', error);
    return null;
  }
}

/**
 * Busca múltiplos streamers do Kick
 * Nota: API oficial permite buscar por slug
 */
export async function searchKickUsers(query: string): Promise<KickChannel[]> {
  try {
    // Tentar buscar diretamente por username exato
    const channel = await getKickChannel(query.toLowerCase());
    return channel ? [channel] : [];
  } catch (error) {
    console.error('Error searching Kick users:', error);
    return [];
  }
}

/**
 * Verifica se um canal do Kick está ao vivo
 */
export async function isKickChannelLive(username: string): Promise<boolean> {
  const channel = await getKickChannel(username);
  return channel?.livestream?.is_live ?? false;
}

/**
 * Obtém informações de viewers de um canal ao vivo
 */
export async function getKickViewerCount(username: string): Promise<number> {
  const channel = await getKickChannel(username);
  return channel?.livestream?.viewer_count ?? 0;
}

/**
 * Obtém streamers em destaque/trending do Kick
 * Nota: A API oficial não tem endpoint público de featured streams ainda
 * Retorna array vazio por enquanto
 */
export async function getKickFeaturedStreams(): Promise<KickChannel[]> {
  try {
    // API oficial não tem endpoint de featured streams ainda
    // Quando estiver disponível, será algo como:
    // https://api.kick.com/public/v1/livestreams?is_live=true&limit=10
    return [];
  } catch (error) {
    console.error('Error fetching Kick featured streams:', error);
    return [];
  }
}
