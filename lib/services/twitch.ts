/**
 * Twitch API Integration Service
 * Docs: https://dev.twitch.tv/docs/api/
 */

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  broadcaster_type: string;
}

interface TwitchChannelSearchResult {
  broadcaster_language: string;
  broadcaster_login: string;
  display_name: string;
  game_id: string;
  game_name: string;
  id: string;
  is_live: boolean;
  tag_ids: string[];
  tags: string[];
  thumbnail_url: string;
  title: string;
  started_at: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
  type: 'live' | '';
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtém token de acesso da Twitch API (App Access Token)
 */
async function getTwitchToken(): Promise<string> {
  // Verifica se já temos um token válido em cache
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitch API credentials not configured');
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitch token: ${response.statusText}`);
  }

  const data: TwitchTokenResponse = await response.json();

  // Cache do token (expires_in - 5 minutos de margem)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

/**
 * Busca canais da Twitch por username
 */
export async function searchTwitchUsers(query: string): Promise<TwitchChannelSearchResult[]> {
  const token = await getTwitchToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  const response = await fetch(
    `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=10`,
    {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Twitch API error:', await response.text());
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Obtém informações de stream ao vivo para um usuário específico
 */
export async function getTwitchStream(username: string): Promise<TwitchStream | null> {
  const token = await getTwitchToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(username)}`,
    {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Twitch API error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

/**
 * Obtém informações de um usuário da Twitch
 */
export async function getTwitchUser(username: string): Promise<TwitchUser | null> {
  const token = await getTwitchToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  const response = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
    {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Twitch API error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

/**
 * Obtém os top streamers ao vivo (mais assistidos)
 * @param limit Número de resultados
 * @param language Idioma/região (pt para português, en para inglês, etc.)
 */
export async function getTopLiveStreams(limit: number = 10, language?: string): Promise<TwitchStream[]> {
  const token = await getTwitchToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  // Construir query params
  const params = new URLSearchParams({
    first: limit.toString(),
  });

  // Adicionar filtro de idioma se fornecido
  if (language) {
    params.append('language', language);
  }

  const response = await fetch(
    `https://api.twitch.tv/helix/streams?${params.toString()}`,
    {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Twitch API error:', await response.text());
    return [];
  }

  const data = await response.json();
  return data.data || [];
}
