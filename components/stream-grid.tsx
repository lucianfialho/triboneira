'use client';

import React from 'react';
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
  onStreamHover: (id: string, isHovering: boolean) => void;
  onStreamClick: (id: string) => void;

  // Platform utilities
  getPlatformEmbed: (url: string, platform: Platform, isMuted: boolean) => string;
  getPlatformColor: (platform: Platform) => string;
  getPlatformIcon: (platform: Platform) => React.ReactElement;

  // Mute toggle
  onToggleMute?: (id: string) => void;
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
  onStreamHover,
  onStreamClick,
  getPlatformEmbed,
  getPlatformColor,
  getPlatformIcon,
  onToggleMute,
}: StreamGridProps) {
  return (
    <div
      className={`layout-${layout} animate-fade-in ${
        !sidebarVisible && !isMobile ? 'h-[100vh]' : ''
      }`}
    >
      {streams.map((stream, index) => {
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

            {/* Mute/Unmute Toggle Button - Sempre visível no hover */}
            {onToggleMute && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMute(stream.id);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer ${
                    stream.isMuted
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-[hsl(217_91%_60%)] hover:bg-[hsl(217_91%_55%)]'
                  }`}
                  title={stream.isMuted ? 'Desmutar' : 'Mutar'}
                >
                  {stream.isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
