'use client';

import { Users, VolumeX, Volume2 } from 'lucide-react';
import type { LayoutType } from '@/components/sidebar';

// Types
type Platform = 'twitch' | 'youtube' | 'kick' | 'custom';

export interface Stream {
  id: string;
  url: string;
  platform: Platform;
  title?: string;
  isMuted: boolean;
  channelName?: string;
  videoId?: string;
  viewerCount?: number;
  isLive?: boolean;
}

export interface StreamGridProps {
  streams: Stream[];
  layout: LayoutType;
  sidebarVisible: boolean;
  isMobile: boolean;

  // Drag & Drop
  draggedStreamIndex: number | null;
  dropTargetIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;

  // Stream interactions
  hoveringStream: string | null;
  unmutingProgress: Record<string, number>;
  onStreamHover: (id: string, isHovering: boolean) => void;
  onStreamClick: (id: string) => void;

  // Platform utilities
  getPlatformEmbed: (url: string, platform: Platform, isMuted: boolean) => string;
  getPlatformColor: (platform: Platform) => string;
  getPlatformIcon: (platform: Platform) => JSX.Element;

  // Mute toggle
  onToggleMute?: (id: string) => void;

  // Hold to unmute mode (para página principal)
  holdToUnmuteMode?: boolean;
}

export function StreamGrid({
  streams,
  layout,
  sidebarVisible,
  isMobile,
  draggedStreamIndex,
  dropTargetIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  hoveringStream,
  unmutingProgress,
  onStreamHover,
  onStreamClick,
  getPlatformEmbed,
  getPlatformColor,
  getPlatformIcon,
  onToggleMute,
  holdToUnmuteMode = false,
}: StreamGridProps) {
  return (
    <div
      className={`layout-${layout} animate-fade-in ${
        !sidebarVisible && !isMobile ? 'h-[100vh] gap-0' : ''
      }`}
    >
      {streams.map((stream, index) => {
        const progress = unmutingProgress[stream.id] || 0;
        const isHovering = hoveringStream === stream.id;

        return (
          <div
            key={stream.id}
            draggable={true}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={`stream-container group ${
              draggedStreamIndex === index ? 'opacity-50' : ''
            } ${
              dropTargetIndex === index ? 'ring-4 ring-[hsl(var(--primary))] ring-offset-2' : ''
            }`}
            style={{
              opacity: draggedStreamIndex === index ? 0.5 : 1,
              visibility: 'visible',
              cursor: 'move',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              maxWidth: isMobile ? '370px' : '100%',
            }}
            onMouseEnter={() => onStreamHover(stream.id, true)}
            onMouseLeave={() => onStreamHover(stream.id, false)}
            onClick={() => onStreamClick(stream.id)}
          >
            {/* Drag Handle Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm z-20 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
              style={{
                pointerEvents: 'auto',
                cursor: 'move',
              }}
            >
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="w-1 h-1 rounded-full bg-white/50" />
              </div>
            </div>

            <iframe
              key={stream.id}
              src={getPlatformEmbed(stream.url, stream.platform, stream.isMuted)}
              width="100%"
              height="100%"
              className="w-full h-full"
              style={{
                minWidth: isMobile ? '100%' : '350px',
                maxWidth: '100%',
                minHeight: '200px',
                display: 'block',
                pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto',
              }}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />

            {/* Stream Overlay */}
            <div
              className="absolute top-3 left-3 flex items-center gap-2"
              style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
            >
              <div className={`px-2.5 py-1.5 rounded-lg bg-gradient-to-br ${getPlatformColor(stream.platform)} backdrop-blur-xl shadow-lg flex items-center gap-2`}>
                {getPlatformIcon(stream.platform)}
                <span className="text-xs font-semibold text-white capitalize">
                  {stream.platform}
                </span>
                {stream.isLive !== undefined && (
                  <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-white">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Channel Info */}
            {stream.channelName && (
              <div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm shadow-lg">
                  <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                    {stream.channelName}
                  </p>
                  {stream.viewerCount !== undefined && (
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stream.viewerCount.toLocaleString()} viewers
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Hold to Unmute Overlay (modo página principal) */}
            {holdToUnmuteMode && stream.isMuted && isHovering && (
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in z-10"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="4"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VolumeX className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-sm font-medium text-white drop-shadow-lg">
                    Hold to unmute
                  </p>
                </div>
              </div>
            )}

            {/* Mute/Unmute Toggle Button (modo template de evento) */}
            {!holdToUnmuteMode && onToggleMute && stream.isMuted && isHovering && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMute(stream.id);
                  }}
                  className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:scale-110 hover:bg-red-500 transition-transform cursor-pointer"
                >
                  <VolumeX className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Unmuted indicator */}
            {onToggleMute && !stream.isMuted && (
              <div
                className={`absolute ${holdToUnmuteMode ? 'bottom-3 right-3' : 'top-3 left-1/2 -translate-x-1/2'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMute(stream.id);
                  }}
                  className="w-10 h-10 rounded-full bg-[hsl(217_91%_60%)] flex items-center justify-center shadow-lg hover:scale-110 hover:bg-[hsl(217_91%_55%)] transition-transform cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Unmuting Progress (if applicable) */}
            {progress > 0 && progress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-white text-sm mt-3 text-center">
                    Unmuting... {Math.round(progress)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
