'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, TrendingUp, Twitch as TwitchIcon, Youtube, Video } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import amplitude from '@/amplitude';
import './command-palette.css';

interface StreamerResult {
  id: string;
  username: string;
  displayName: string;
  platform: 'twitch' | 'youtube' | 'kick';
  avatarUrl: string;
  isLive: boolean;
  currentViewers: number;
  currentTitle?: string;
  url: string;
}

interface Props {
  onSelectStreamer: (streamer: StreamerResult) => void;
}

const platformIcons = {
  twitch: TwitchIcon,
  youtube: Youtube,
  kick: Video,
};

const platformColors = {
  twitch: 'text-purple-400',
  youtube: 'text-red-500',
  kick: 'text-green-500',
};

function formatViewers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function StreamerCommandPalette({ onSelectStreamer }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [streamers, setStreamers] = useState<StreamerResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Cmd+K ou Ctrl+K para abrir
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);

        if (!open) {
          amplitude.track('Command Palette Opened', {
            trigger: 'keyboard_shortcut',
          });
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  // Fetch streamers quando abre ou quando search muda
  useEffect(() => {
    if (!open) return;

    const fetchStreamers = async () => {
      setLoading(true);
      try {
        const query = search.length >= 2 ? `?q=${encodeURIComponent(search)}` : '';
        const response = await fetch(`/api/streamers/search${query}`);
        const data = await response.json();
        setStreamers(data.results || []);

        if (search.length >= 2) {
          amplitude.track('Streamer Search', {
            query: search,
            results_count: data.results?.length || 0,
            has_live_results: data.results?.some((s: StreamerResult) => s.isLive) || false,
          });
        }
      } catch (error) {
        console.error('Error fetching streamers:', error);
        setStreamers([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce
    const timer = setTimeout(fetchStreamers, 300);
    return () => clearTimeout(timer);
  }, [open, search]);

  const handleSelect = (streamer: StreamerResult) => {
    amplitude.track('Streamer Selected from Command Palette', {
      streamer_username: streamer.username,
      platform: streamer.platform,
      is_live: streamer.isLive,
      viewers: streamer.currentViewers,
      search_query: search,
      position: streamers.findIndex(s => s.id === streamer.id) + 1,
    });

    onSelectStreamer(streamer);
    setOpen(false);
    setSearch('');
  };

  const liveStreamers = streamers.filter(s => s.isLive);
  const offlineStreamers = streamers.filter(s => !s.isLive);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearch('');
          amplitude.track('Command Palette Closed', {
            search_query: search,
            streamers_shown: streamers.length,
          });
        }
      }}
      label="Buscar streamers"
      className="command-palette"
    >
      {/* Accessible title for screen readers */}
      <VisuallyHidden.Root>
        <h1>Buscar streamers nas plataformas Twitch, YouTube e Kick</h1>
      </VisuallyHidden.Root>

      <div className="command-palette-input-wrapper">
        <Search className="command-palette-search-icon" />
        <Command.Input
          placeholder="Digite o nome do streamer..."
          value={search}
          onValueChange={setSearch}
          className="command-palette-input"
        />
      </div>

      <Command.List className="command-palette-list">
        {loading && (
          <div className="command-palette-loading">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        )}

        {!loading && streamers.length === 0 && search.length >= 2 && (
          <Command.Empty className="command-palette-empty">
            <div className="text-center py-8">
              <p className="text-[hsl(var(--muted-foreground))] mb-4">
                ⚠️ Nenhum streamer encontrado para &quot;{search}&quot;
              </p>
              <p className="text-sm text-[hsl(var(--subtle-foreground))]">
                Tente usar a URL completa da Twitch, YouTube ou Kick
              </p>
            </div>
          </Command.Empty>
        )}

        {!loading && liveStreamers.length > 0 && (
          <Command.Group heading="🔥 AO VIVO AGORA" className="command-palette-group">
            {liveStreamers.map((streamer) => {
              const PlatformIcon = platformIcons[streamer.platform];
              return (
                <Command.Item
                  key={streamer.id}
                  value={`${streamer.username}-${streamer.platform}`}
                  onSelect={() => handleSelect(streamer)}
                  className="command-palette-item"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <img
                        src={streamer.avatarUrl}
                        alt={streamer.displayName}
                        className="w-12 h-12 rounded-full border-2 border-[hsl(var(--border))]"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${streamer.displayName}&background=random`;
                        }}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border-2 border-[hsl(var(--background))] rounded-full animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[hsl(var(--foreground))]">
                          {streamer.displayName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                          🔴 LIVE
                        </span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatViewers(streamer.currentViewers)} viewers
                        </span>
                      </div>
                      {streamer.currentTitle && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                          {streamer.currentTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <PlatformIcon className={`w-3.5 h-3.5 ${platformColors[streamer.platform]}`} />
                        <span className={`text-xs ${platformColors[streamer.platform]} capitalize`}>
                          {streamer.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}

        {!loading && offlineStreamers.length > 0 && (
          <Command.Group heading="Offline" className="command-palette-group">
            {offlineStreamers.map((streamer) => {
              const PlatformIcon = platformIcons[streamer.platform];
              return (
                <Command.Item
                  key={streamer.id}
                  value={`${streamer.username}-${streamer.platform}`}
                  onSelect={() => handleSelect(streamer)}
                  className="command-palette-item opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={streamer.avatarUrl}
                      alt={streamer.displayName}
                      className="w-12 h-12 rounded-full border-2 border-[hsl(var(--border))] opacity-50"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${streamer.displayName}&background=random`;
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[hsl(var(--foreground))]">
                          {streamer.displayName}
                        </span>
                        <span className="text-sm text-[hsl(var(--subtle-foreground))]">
                          ⚫ Offline
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlatformIcon className={`w-3.5 h-3.5 ${platformColors[streamer.platform]}`} />
                        <span className={`text-xs ${platformColors[streamer.platform]} capitalize`}>
                          {streamer.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}

        {!loading && search.length < 2 && streamers.length > 0 && (
          <div className="command-palette-hint">
            <TrendingUp className="w-4 h-4" />
            <span>Streamers mais assistidos agora</span>
          </div>
        )}
      </Command.List>

      <div className="command-palette-footer">
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--subtle-foreground))]">
          <span className="flex items-center gap-1">
            <kbd className="command-palette-kbd">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="command-palette-kbd">Enter</kbd> selecionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="command-palette-kbd">Esc</kbd> fechar
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}
