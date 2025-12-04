'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface KickPlayerProps {
  channelName: string;
  volume: number;
  isMuted: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function KickPlayer({ channelName, volume, isMuted, className, style }: KickPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const initPlayer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stream URL from our API
        const response = await fetch(`/api/kick-stream?channel=${channelName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stream URL');
        }

        const data = await response.json();
        if (!data.playbackUrl) {
          throw new Error('Stream URL not available');
        }

        // Initialize HLS.js
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(data.playbackUrl);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(err => {
              console.log('Autoplay blocked:', err);
            });
            setLoading(false);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS.js fatal error:', data);
              setError('Failed to load stream');

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.log('Cannot recover from error');
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          videoElement.src = data.playbackUrl;
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(err => {
              console.log('Autoplay blocked:', err);
            });
            setLoading(false);
          });
        } else {
          throw new Error('HLS not supported in this browser');
        }
      } catch (err) {
        console.error('Error initializing Kick player:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stream');
        setLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channelName]);

  // Update volume when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }} className={className}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
        }}
        playsInline
        controls={false}
      />

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
        }}>
          Carregando stream...
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ff4444',
          padding: '20px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
