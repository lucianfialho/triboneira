import { NextRequest, NextResponse } from 'next/server';

type Platform = 'twitch' | 'youtube' | 'kick';

interface StreamInfo {
  viewerCount: number;
  title?: string;
  isLive: boolean;
}

// Twitch API requires client ID and token - for now we'll use public endpoints where possible
async function getTwitchStreamInfo(channelName: string): Promise<StreamInfo> {
  try {
    // Using Twitch's public API (requires app credentials in production)
    // For demo purposes, we'll use a fallback
    const response = await fetch(
      `https://decapi.me/twitch/viewercount/${channelName}`,
      { next: { revalidate: 30 } } // Cache for 30 seconds
    );

    const text = await response.text();
    const viewerCount = parseInt(text, 10);

    return {
      viewerCount: isNaN(viewerCount) ? 0 : viewerCount,
      isLive: !isNaN(viewerCount),
    };
  } catch (error) {
    console.error('Error fetching Twitch info:', error);
    return { viewerCount: 0, isLive: false };
  }
}

async function getYouTubeStreamInfo(videoId: string): Promise<StreamInfo> {
  try {
    // YouTube requires API key for accurate data
    // For demo, we'll return estimated values
    // In production, use YouTube Data API v3
    return {
      viewerCount: 0, // Requires YouTube API key
      isLive: true,
      title: 'YouTube Live',
    };
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    return { viewerCount: 0, isLive: false };
  }
}

async function getKickStreamInfo(channelName: string): Promise<StreamInfo> {
  try {
    // Kick API endpoint with headers to avoid blocking
    const response = await fetch(
      `https://kick.com/api/v2/channels/${channelName}`,
      {
        next: { revalidate: 30 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return { viewerCount: 0, isLive: false };
    }

    const data = await response.json();
    const livestream = data.livestream;

    return {
      viewerCount: livestream?.viewer_count || 0,
      title: livestream?.session_title,
      isLive: !!livestream,
    };
  } catch (error) {
    console.error('Error fetching Kick info:', error);
    return { viewerCount: 0, isLive: false };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as Platform;
  const identifier = searchParams.get('identifier'); // channel name or video ID

  if (!platform || !identifier) {
    return NextResponse.json(
      { error: 'Missing platform or identifier' },
      { status: 400 }
    );
  }

  let streamInfo: StreamInfo;

  switch (platform) {
    case 'twitch':
      streamInfo = await getTwitchStreamInfo(identifier);
      break;
    case 'youtube':
      streamInfo = await getYouTubeStreamInfo(identifier);
      break;
    case 'kick':
      streamInfo = await getKickStreamInfo(identifier);
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
  }

  return NextResponse.json(streamInfo);
}
