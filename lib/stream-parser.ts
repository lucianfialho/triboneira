import { Platform, Stream } from '@/types';

export function parseStreamUrl(url: string): Stream | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Twitch
  const twitchMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.|m\.)?twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (twitchMatch) {
    const channel = twitchMatch[1];
    return {
      id: `tw-${Date.now()}`,
      platform: 'twitch',
      url: trimmed,
      channelName: channel,
      embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=localhost&parent=vercel.app&autoplay=true&muted=false`,
    };
  }

  // YouTube
  const ytMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      id: `yt-${Date.now()}`,
      platform: 'youtube',
      url: trimmed,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    };
  }

  // Kick
  const kickMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_-]+)/);
  if (kickMatch) {
    const channel = kickMatch[1];
    return {
      id: `kick-${Date.now()}`,
      platform: 'kick',
      url: trimmed,
      channelName: channel,
      embedUrl: `https://player.kick.com/${channel}`,
    };
  }

  return null;
}

export function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    twitch: 'from-purple-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    kick: 'from-green-500 to-green-600',
    custom: 'from-blue-500 to-blue-600',
  };
  return colors[platform];
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    twitch: '🟣',
    youtube: '🔴',
    kick: '🟢',
    custom: '🔵',
  };
  return icons[platform];
}
