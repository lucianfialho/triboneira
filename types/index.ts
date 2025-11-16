export type Platform = 'twitch' | 'youtube' | 'kick';

export interface Stream {
  id: string;
  platform: Platform;
  url: string;
  channelName?: string;
  videoId?: string;
  embedUrl: string;
}

export type LayoutType = '1x1' | '2x1' | '2x2' | '3x1' | '1+2' | '1+3';

export interface Layout {
  id: LayoutType;
  name: string;
  maxStreams: number;
  cols: number;
  rows: number;
}
