import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channel = searchParams.get('channel');

  if (!channel) {
    return NextResponse.json({ error: 'Channel is required' }, { status: 400 });
  }

  try {
    // Fetch channel info from Kick API
    const response = await fetch(`https://kick.com/api/v2/channels/${channel}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch channel data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract playback URL
    const playbackUrl = data.playback_url;
    const isLive = data.livestream !== null;

    if (!playbackUrl) {
      return NextResponse.json(
        { error: 'Stream URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      playbackUrl,
      isLive,
      channelId: data.id,
      channelName: data.user?.username || channel,
      thumbnail: data.livestream?.thumbnail?.url,
    });
  } catch (error) {
    console.error('Error fetching Kick stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
