'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Search, TrendingUp, Twitch as TwitchIcon, Youtube, Video } from 'lucide-react';
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
  existingStreams?: Array<{ platform: string; channelName: string }>;
}

export interface CommandPaletteRef {
  open: () => void;
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

export const StreamerCommandPalette = forwardRef<CommandPaletteRef, Props>(
  function StreamerCommandPalette({ onSelectStreamer, existingStreams = [] }, ref) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [streamers, setStreamers] = useState<StreamerResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [platformFilter, setPlatformFilter] = useState<'kick' | 'youtube' | 'twitch' | null>(null);

    // Expose open method via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        amplitude.track('Command Palette Opened', {
          trigger: 'input_click',
        });
      },
    }));

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
          // Se o input está vazio e não tem filtro, carregar top streamers de todas as plataformas
          if (search.length === 0 && !platformFilter) {
            // Fazer requisição para buscar top streamers (sem query, sem filtro)
            const response = await fetch('/api/streamers/search?q=');
            const data = await response.json();

            const filteredResults = (data.results || []).filter((streamer: StreamerResult) => {
              return !existingStreams.some(
                existing =>
                  existing.channelName.toLowerCase() === streamer.username.toLowerCase() &&
                  existing.platform === streamer.platform
              );
            });

            setStreamers(filteredResults);
            setLoading(false);
            return;
          }

          // Se o input está vazio mas tem filtro, carregar top streamers da plataforma filtrada
          if (search.length === 0 && platformFilter) {
            const response = await fetch(`/api/streamers/search?q=&platform=${platformFilter}`);
            const data = await response.json();

            const filteredResults = (data.results || []).filter((streamer: StreamerResult) => {
              return !existingStreams.some(
                existing =>
                  existing.channelName.toLowerCase() === streamer.username.toLowerCase() &&
                  existing.platform === streamer.platform
              );
            });

            setStreamers(filteredResults);
            setLoading(false);
            return;
          }


          // Detectar se é uma URL do YouTube
          const youtubeMatch = search.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/);

          if (youtubeMatch) {
            const videoId = youtubeMatch[1];

            // Buscar informações do vídeo
            const response = await fetch(`/api/stream-info?platform=youtube&identifier=${videoId}`);

            if (response.ok) {
              const videoInfo = await response.json();

              // Adicionar o vídeo automaticamente
              const videoStreamer = {
                id: `youtube-video-${videoId}`,
                username: videoId,
                displayName: videoInfo.title || 'YouTube Video',
                platform: 'youtube' as const,
                avatarUrl: videoInfo.thumbnail || 'https://www.youtube.com/img/desktop/yt_1200.png',
                isLive: videoInfo.isLive || false,
                currentViewers: videoInfo.viewerCount || 0,
                currentTitle: videoInfo.title || '',
                url: search,
              };

              // Adicionar automaticamente
              onSelectStreamer(videoStreamer);

              // Fechar o Command Palette
              setOpen(false);
              setSearch('');
              setPlatformFilter(null);
              setLoading(false);

              amplitude.track('YouTube Video Added from URL', {
                videoId,
                title: videoInfo.title,
                isLive: videoInfo.isLive,
              });

              return;
            }
          }

          // Detectar se é uma URL de outra plataforma
          const isUrl = search.match(/^https?:\/\//);

          if (isUrl) {
            // Se for URL de outra plataforma, mostrar mensagem
            setStreamers([]);
            setLoading(false);
            return;
          }

          // Fazer a busca - mesmo sem query, se tiver filtro de plataforma
          let query = search.length >= 2 || platformFilter ? `?q=${encodeURIComponent(search)}` : '';

          // Adicionar filtro de plataforma se ativo
          if (platformFilter) {
            query += query.includes('?') ? `&platform=${platformFilter}` : `?platform=${platformFilter}`;
          }

          const response = await fetch(`/api/streamers/search${query}`);
          const data = await response.json();

          // Filtrar streamers que já estão adicionados
          const filteredResults = (data.results || []).filter((streamer: StreamerResult) => {
            return !existingStreams.some(
              existing =>
                existing.channelName.toLowerCase() === streamer.username.toLowerCase() &&
                existing.platform === streamer.platform
            );
          });

          setStreamers(filteredResults);

          if (search.length >= 2 || platformFilter) {
            amplitude.track('Streamer Search', {
              query: search,
              results_count: filteredResults.length,
              has_live_results: filteredResults.some((s: StreamerResult) => s.isLive) || false,
              filtered_count: (data.results?.length || 0) - filteredResults.length,
              platform_filter: platformFilter,
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
    }, [open, search, existingStreams, platformFilter]);

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
      setPlatformFilter(null);
    };

    const liveStreamers = streamers.filter(s => s.isLive);
    const offlineStreamers = streamers.filter(s => !s.isLive);

    return (
      <Dialog.Root
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setSearch('');
            setPlatformFilter(null);
            amplitude.track('Command Palette Closed', {
              search_query: search,
              streamers_shown: streamers.length,
              platform_filter: platformFilter,
            });
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="command-palette-overlay" />
          <Dialog.Content className="command-palette-content">
            {/* Accessible title for screen readers */}
            <VisuallyHidden.Root>
              <Dialog.Title>Buscar streamers nas plataformas Twitch, YouTube e Kick</Dialog.Title>
            </VisuallyHidden.Root>

            <Command label="Buscar streamers" className="command-palette">
              <div className="command-palette-input-wrapper">
                <Search className="command-palette-search-icon" />
                {platformFilter && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${platformFilter === 'twitch' ? 'bg-purple-500/20 text-purple-400' : platformFilter === 'youtube' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {platformFilter === 'twitch' && <TwitchIcon className="w-3 h-3" />}
                    {platformFilter === 'youtube' && <Youtube className="w-3 h-3" />}
                    {platformFilter === 'kick' && <Video className="w-3 h-3" />}
                    {platformFilter}
                  </span>
                )}
                <Command.Input
                  placeholder={platformFilter ? `Buscar em ${platformFilter}...` : "Digite o nome do streamer..."}
                  value={search}
                  onValueChange={setSearch}
                  className="command-palette-input"
                />
              </div>

              {/* Platform Filter Buttons */}
              <div className="flex gap-2 px-3 pb-2 border-b border-[hsl(var(--border))]">
                <button
                  onClick={() => setPlatformFilter(platformFilter === 'kick' ? null : 'kick')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${platformFilter === 'kick'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                    }`}
                >
                  <Video className="w-4 h-4" />
                  Kick
                </button>
                <button
                  onClick={() => setPlatformFilter(platformFilter === 'twitch' ? null : 'twitch')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${platformFilter === 'twitch'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                    }`}
                >
                  <TwitchIcon className="w-4 h-4" />
                  Twitch
                </button>
                <button
                  onClick={() => setPlatformFilter(platformFilter === 'youtube' ? null : 'youtube')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${platformFilter === 'youtube'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                    }`}
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </button>
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
                      {search.match(/^https?:\/\//) ? (
                        <>
                          <p className="text-[hsl(var(--muted-foreground))] mb-4">
                            💡 Detectamos uma URL!
                          </p>
                          <p className="text-sm text-[hsl(var(--subtle-foreground))] mb-2">
                            Para adicionar um stream via URL, use o campo
                          </p>
                          <p className="text-sm font-semibold text-[hsl(var(--primary))]">
                            &quot;Paste stream URL...&quot; na sidebar
                          </p>
                          <p className="text-xs text-[hsl(var(--subtle-foreground))] mt-4">
                            Este campo é para buscar streamers por nome 😊
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[hsl(var(--muted-foreground))] mb-4">
                            ⚠️ Nenhum streamer encontrado para &quot;{search}&quot;
                          </p>
                          <p className="text-sm text-[hsl(var(--subtle-foreground))]">
                            Tente usar a URL completa da Twitch, YouTube ou Kick
                          </p>
                        </>
                      )}
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
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);
