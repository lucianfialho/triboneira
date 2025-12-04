'use client';

import { useEffect, useRef } from 'react';

interface PlayerControl {
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
}

// Twitch Player API
interface TwitchPlayer {
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  getMuted: () => boolean;
  getVolume: () => number;
}

// YouTube Player API
interface YouTubePlayer {
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVolume: () => number;
}

declare global {
  interface Window {
    Twitch?: {
      Player: new (elementId: string, options: any) => TwitchPlayer;
    };
    YT?: {
      Player: new (elementId: string, options: any) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function usePlayerControl(
  streamId: string,
  platform: 'twitch' | 'youtube' | 'kick' | 'custom',
  iframeRef: React.RefObject<HTMLIFrameElement | null>
): PlayerControl {
  const playerRef = useRef<TwitchPlayer | YouTubePlayer | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;

    // Initialize player based on platform
    if (platform === 'twitch') {
      // Twitch players can be controlled via postMessage
      const control: PlayerControl = {
        setVolume: (volume: number) => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              type: 'setVolume',
              value: volume / 100, // Twitch uses 0-1 range
            }),
            '*'
          );
        },
        mute: () => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              type: 'setMuted',
              value: true,
            }),
            '*'
          );
        },
        unmute: () => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              type: 'setMuted',
              value: false,
            }),
            '*'
          );
        },
      };

      playerRef.current = control as any;
    } else if (platform === 'youtube') {
      // YouTube players can be controlled via postMessage with YouTube IFrame API
      const control: PlayerControl = {
        setVolume: (volume: number) => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [volume],
            }),
            '*'
          );
        },
        mute: () => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'mute',
            }),
            '*'
          );
        },
        unmute: () => {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'unMute',
            }),
            '*'
          );
        },
      };

      playerRef.current = control as any;
    } else if (platform === 'kick') {
      // Kick doesn't have a public API, we'll need to reload iframe with volume parameter
      const control: PlayerControl = {
        setVolume: (volume: number) => {
          // Kick player doesn't support dynamic volume control via API
          // We'll handle this by updating the iframe src
          console.warn('Kick player volume control requires iframe reload');
        },
        mute: () => {
          console.warn('Kick player mute requires iframe reload');
        },
        unmute: () => {
          console.warn('Kick player unmute requires iframe reload');
        },
      };

      playerRef.current = control as any;
    }

    return () => {
      playerRef.current = null;
    };
  }, [streamId, platform, iframeRef]);

  return {
    setVolume: (volume: number) => {
      if (platform === 'twitch') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: 'setVolume',
            value: volume / 100,
          }),
          '*'
        );
      } else if (platform === 'youtube') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [volume],
          }),
          '*'
        );
      }
    },
    mute: () => {
      if (platform === 'twitch') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: 'setMuted',
            value: true,
          }),
          '*'
        );
      } else if (platform === 'youtube') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'mute',
          }),
          '*'
        );
      }
    },
    unmute: () => {
      if (platform === 'twitch') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            type: 'setMuted',
            value: false,
          }),
          '*'
        );
      } else if (platform === 'youtube') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'unMute',
          }),
          '*'
        );
      }
    },
  };
}
