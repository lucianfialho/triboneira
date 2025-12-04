'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  streamId: string;
  volume: number;
  isMuted: boolean;
  platform?: 'twitch' | 'youtube' | 'kick' | 'custom';
  onVolumeChange: (streamId: string, volume: number) => void;
  onMuteToggle: (streamId: string) => void;
}

export function VolumeControl({
  streamId,
  volume,
  isMuted,
  platform,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);
  const isKick = platform === 'kick';

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-5 h-5 text-white" />;
    }
    if (volume < 50) {
      return <Volume1 className="w-5 h-5 text-white" />;
    }
    return <Volume2 className="w-5 h-5 text-white" />;
  };

  const handleSliderChange = (values: number[]) => {
    const newVolume = values[0];
    onVolumeChange(streamId, newVolume);
  };

  return (
    <div
      className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg"
      onMouseEnter={() => !isKick && setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Mute/Unmute Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMuteToggle(streamId);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        title={isMuted ? 'Desmutar' : 'Mutar'}
      >
        {getVolumeIcon()}
      </button>

      {/* Volume Slider - Hidden for Kick */}
      {!isKick && (
        <>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleSliderChange}
              className="cursor-pointer"
              disabled={isMuted}
            />
          </div>

          {/* Volume Percentage */}
          {showSlider && (
            <span className="text-xs text-white/80 font-medium min-w-[2rem] text-right">
              {isMuted ? '0' : volume}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
