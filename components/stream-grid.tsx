'use client';

import React, { useRef } from 'react';
import { Users } from 'lucide-react';
import type { LayoutType } from '@/components/sidebar';
import { VolumeControl } from '@/components/volume-control';

// Types
type Platform = 'twitch' | 'youtube' | 'kick' | 'custom';

export interface Stream {
  id: string;
  url: string;
  platform: Platform;
  title?: string;
  isMuted: boolean;
  volume: number;
  channelName?: string;
  videoId?: string;
  viewerCount?: number;
  isLive?: boolean;
}

interface StreamItemProps {
  stream: Stream;
  index: number;
  isHovering: boolean;
  draggedStreamIndex: number | null;
  dropTargetIndex: number | null;
  isMobile: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onStreamHover: (id: string, isHovering: boolean) => void;
  onStreamClick: (id: string) => void;
  getPlatformEmbed: (url: string, platform: Platform, isMuted: boolean) => string;
  getPlatformColor: (platform: Platform) => string;
  getPlatformIcon: (platform: Platform) => React.ReactElement;
  onToggleMute?: (id: string) => void;
  onVolumeChange?: (id: string, volume: number) => void;
}

function StreamItem({
  stream,
  index,
  isHovering,
  draggedStreamIndex,
  dropTargetIndex,
  isMobile,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onStreamHover,
  onStreamClick,
  getPlatformEmbed,
  getPlatformColor,
  getPlatformIcon,
  onToggleMute,
  onVolumeChange,
}: StreamItemProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get embed URL with volume - only reload for Twitch (supports volume in URL)
  const getEmbedUrl = () => {
    if (stream.platform === 'twitch') {
      const twitchChannel = stream.url.split('twitch.tv/')[1]?.split('/')[0];
      return `https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&autoplay=true&muted=${stream.isMuted}&volume=${stream.volume / 100}`;
    }
    // For other platforms, use standard embed (volume control via postMessage or not supported)
    return getPlatformEmbed(stream.url, stream.platform, stream.isMuted);
  };

  const handleVolumeChange = (streamId: string, volume: number) => {
    // For YouTube, try to control via postMessage
    if (stream.platform === 'youtube' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volume],
        }),
        '*'
      );
    }
    onVolumeChange?.(streamId, volume);
  };

  const handleMuteToggle = (streamId: string) => {
    // For YouTube, try to control via postMessage
    if (stream.platform === 'youtube' && iframeRef.current) {
      if (stream.isMuted) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'unMute',
          }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'mute',
          }),
          '*'
        );
      }
    }
    onToggleMute?.(streamId);
  };

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
        ref={iframeRef}
        key={stream.platform === 'twitch' ? `${stream.id}-${stream.volume}-${stream.isMuted}` : stream.id}
        src={getEmbedUrl()}
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

      {/* Volume Control - Sempre visível no hover */}
      {onToggleMute && onVolumeChange && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
        >
          <VolumeControl
            streamId={stream.id}
            volume={stream.volume}
            isMuted={stream.isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
          />
        </div>
      )}
    </div>
  );
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

  // Volume control
  onToggleMute?: (id: string) => void;
  onVolumeChange?: (id: string, volume: number) => void;
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
  onVolumeChange,
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
          <StreamItem
            key={stream.id}
            stream={stream}
            index={index}
            isHovering={isHovering}
            draggedStreamIndex={draggedStreamIndex}
            dropTargetIndex={dropTargetIndex}
            isMobile={isMobile}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            onStreamHover={onStreamHover}
            onStreamClick={onStreamClick}
            getPlatformEmbed={getPlatformEmbed}
            getPlatformColor={getPlatformColor}
            getPlatformIcon={getPlatformIcon}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
          />
        );
      })}
    </div>
  );
}
