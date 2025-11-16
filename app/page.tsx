'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import amplitude from '@/amplitude';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Layout,
  Monitor,
  Video,
  Sparkles,
  Grid2x2,
  Grid3x3,
  Columns2,
  Columns3,
  Square,
  Youtube,
  Twitch as TwitchIcon,
  Volume2,
  VolumeX,
  Headphones,
  Copy,
  ExternalLink,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Check,
} from 'lucide-react';

// Types
type Platform = 'twitch' | 'youtube' | 'kick' | 'custom';

interface Stream {
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

type LayoutType = 'single' | 'pip' | 'main-side' | 'focused' | 'grid';

// Platform Detection
const detectPlatform = (url: string): Platform => {
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('kick.com')) return 'kick';
  return 'custom'; // Any other URL is treated as custom embed
};

const extractChannelInfo = (url: string, platform: Platform): { channelName?: string; videoId?: string } => {
  switch (platform) {
    case 'twitch':
      const twitchChannel = url.split('twitch.tv/')[1]?.split('/')[0];
      return { channelName: twitchChannel };
    case 'youtube':
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return { videoId };
    case 'kick':
      const kickChannel = url.split('kick.com/')[1]?.split('/')[0];
      return { channelName: kickChannel };
    default:
      return {};
  }
};

const getPlatformEmbed = (url: string, platform: Platform, isMuted: boolean = false): string => {
  switch (platform) {
    case 'twitch':
      const twitchChannel = url.split('twitch.tv/')[1]?.split('/')[0];
      return `https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&muted=${isMuted}`;
    case 'youtube':
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      // Works for both live streams and regular videos
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&enablejsapi=1`;
    case 'kick':
      const kickChannel = url.split('kick.com/')[1]?.split('/')[0];
      return `https://player.kick.com/${kickChannel}${isMuted ? '?muted=true' : ''}`;
    case 'custom':
      // For custom URLs, use them directly (Netflix, Prime, etc)
      return url;
    default:
      return url;
  }
};

const getPlatformColor = (platform: Platform): string => {
  switch (platform) {
    case 'twitch': return 'from-purple-500 to-purple-600';
    case 'youtube': return 'from-red-500 to-red-600';
    case 'kick': return 'from-green-500 to-green-600';
    case 'custom': return 'from-blue-500 to-blue-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case 'twitch': return <TwitchIcon className="w-3.5 h-3.5" />;
    case 'youtube': return <Youtube className="w-3.5 h-3.5" />;
    case 'kick': return <Video className="w-3.5 h-3.5" />;
    case 'custom': return <Monitor className="w-3.5 h-3.5" />;
    default: return <Monitor className="w-3.5 h-3.5" />;
  }
};

// Layout Configurations
const layoutConfigs = {
  'single': { icon: Square, label: 'Single', description: '1 stream full' },
  'pip': { icon: Maximize2, label: 'PiP', description: '1 main + small' },
  'main-side': { icon: Columns2, label: 'Sidebar', description: '1 main + side' },
  'focused': { icon: Layout, label: 'Focused', description: '1 large + grid' },
  'grid': { icon: Grid2x2, label: 'Grid', description: 'Equal grid' },
};

const STORAGE_KEY = 'multistream-data';

// Helper function to format numbers
const formatViewerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function HomePage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [hoveringStream, setHoveringStream] = useState<string | null>(null);
  const [unmutingProgress, setUnmutingProgress] = useState<Record<string, number>>({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const changeLayout = (newLayout: LayoutType) => {
    amplitude.track('Layout Changed', {
      from: layout,
      to: newLayout,
      streamCount: streams.length,
      layoutDescription: layoutConfigs[newLayout].description,
    });
    setLayout(newLayout);
  };

  // Track initial layout usage on mount
  useEffect(() => {
    if (streams.length > 0) {
      amplitude.track('Layout Viewed', {
        layout,
        layoutDescription: layoutConfigs[layout].description,
        streamCount: streams.length,
      });
    }
  }, [layout, streams.length]);

  const toggleSidebar = () => {
    amplitude.track('Sidebar Toggled', {
      action: sidebarVisible ? 'hide' : 'show',
    });
    setSidebarVisible(!sidebarVisible);
  };

  const shareSetup = () => {
    if (streams.length === 0) return;

    // Encode streams as URL params
    const streamsParam = streams.map(s => {
      const id = s.channelName || s.videoId || encodeURIComponent(s.url);
      return `${s.platform}:${id}`;
    }).join(',');

    const url = `${window.location.origin}${window.location.pathname}?streams=${streamsParam}&layout=${layout}`;

    navigator.clipboard.writeText(url);
    setCopied(true);

    // Track share
    amplitude.track('Setup Shared', {
      streamCount: streams.length,
      layout,
      platforms: streams.map(s => s.platform),
    });

    setTimeout(() => setCopied(false), 2000);
  };

  // Load from URL params or localStorage on mount
  useEffect(() => {
    try {
      // Check URL params first
      const params = new URLSearchParams(window.location.search);
      const streamsParam = params.get('streams');
      const layoutParam = params.get('layout') as LayoutType;

      if (streamsParam) {
        // Parse streams from URL
        const streamDefs = streamsParam.split(',');
        const loadedStreams: Stream[] = streamDefs.map((def, index) => {
          const [platform, id] = def.split(':') as [Platform, string];

          let url = '';
          let channelName: string | undefined;
          let videoId: string | undefined;

          if (platform === 'twitch') {
            channelName = id;
            url = `https://twitch.tv/${id}`;
          } else if (platform === 'youtube') {
            videoId = id;
            url = `https://youtube.com/watch?v=${id}`;
          } else if (platform === 'kick') {
            channelName = id;
            url = `https://kick.com/${id}`;
          } else if (platform === 'custom') {
            url = decodeURIComponent(id);
          }

          return {
            id: `${Date.now()}-${index}`,
            url,
            platform,
            channelName,
            videoId,
            isMuted: index > 0,
            viewerCount: 0,
            isLive: false,
          };
        });

        setStreams(loadedStreams);
        if (layoutParam && layoutConfigs[layoutParam]) {
          setLayout(layoutParam);
        }

        // Track shared link opened
        amplitude.track('Shared Setup Opened', {
          streamCount: loadedStreams.length,
          layout: layoutParam || 'grid',
          platforms: loadedStreams.map(s => s.platform),
        });

        // Clear URL params after loading
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setStreams(data.streams || []);
          setLayout(data.layout || 'grid');
        }
      }
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  }, []);

  // Save to localStorage whenever streams or layout changes
  useEffect(() => {
    try {
      const data = {
        streams,
        layout,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [streams, layout]);

  // Fetch viewer counts periodically
  useEffect(() => {
    if (streams.length === 0) return;

    const fetchStreamInfo = async () => {
      for (const stream of streams) {
        const identifier = stream.channelName || stream.videoId;
        if (!identifier) continue;

        try {
          let data;

          // For Kick, fetch directly from browser to avoid CORS/blocking
          if (stream.platform === 'kick') {
            const response = await fetch(`https://kick.com/api/v2/channels/${identifier}`);
            if (response.ok) {
              const kickData = await response.json();
              const livestream = kickData.livestream;
              data = {
                viewerCount: livestream?.viewer_count || 0,
                isLive: !!livestream,
                title: livestream?.session_title,
              };
            } else {
              data = { viewerCount: 0, isLive: false };
            }
          } else {
            // For Twitch and YouTube, use our API route
            const response = await fetch(
              `/api/stream-info?platform=${stream.platform}&identifier=${identifier}`
            );
            if (!response.ok) continue;
            data = await response.json();
          }

          console.log(`Fetched data for ${stream.platform}/${identifier}:`, data);

          setStreams(prevStreams =>
            prevStreams.map(s =>
              s.id === stream.id
                ? {
                    ...s,
                    viewerCount: data.viewerCount,
                    isLive: data.isLive,
                    title: data.title || s.title,
                  }
                : s
            )
          );
        } catch (error) {
          console.error('Error fetching stream info:', error);
        }
      }
    };

    // Fetch immediately
    fetchStreamInfo();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchStreamInfo, 30000);

    return () => clearInterval(interval);
  }, [streams.map(s => s.id).join(',')]); // Depend on stream IDs

  const addStream = () => {
    if (!inputUrl.trim()) return;

    const platform = detectPlatform(inputUrl);
    const channelInfo = extractChannelInfo(inputUrl, platform);

    const newStream: Stream = {
      id: Date.now().toString(),
      url: inputUrl,
      platform,
      isMuted: streams.length > 0, // Mute all streams after the first one
      ...channelInfo,
      viewerCount: 0,
      isLive: false,
    };

    // Track stream addition
    amplitude.track('Stream Added', {
      platform,
      streamCount: streams.length + 1,
      channelName: channelInfo.channelName,
      videoId: channelInfo.videoId,
    });

    setStreams([...streams, newStream]);
    setInputUrl('');

    // Show share modal when adding 2nd stream
    if (streams.length === 1) {
      setTimeout(() => setShowShareModal(true), 500);
    }
  };

  const toggleMute = (id: string) => {
    setStreams(streams.map(s =>
      s.id === id ? { ...s, isMuted: !s.isMuted } : s
    ));
  };

  const handleStreamHover = (id: string, isHovering: boolean) => {
    if (!isHovering) {
      setHoveringStream(null);
      setUnmutingProgress(prev => ({ ...prev, [id]: 0 }));
      return;
    }

    const stream = streams.find(s => s.id === id);
    if (!stream?.isMuted) return;

    setHoveringStream(id);

    // Start progress animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setUnmutingProgress(prev => ({ ...prev, [id]: progress }));

      if (progress >= 100) {
        clearInterval(interval);
        toggleMute(id);
        setHoveringStream(null);
        setUnmutingProgress(prev => ({ ...prev, [id]: 0 }));
      }
    }, 20); // 100 updates over 2 seconds (2000ms / 20ms = 100 steps)
  };

  const removeStream = (id: string) => {
    const stream = streams.find(s => s.id === id);

    // Track stream removal
    if (stream) {
      amplitude.track('Stream Removed', {
        platform: stream.platform,
        streamCount: streams.length - 1,
      });
    }

    setStreams(streams.filter(s => s.id !== id));
  };

  const soloAudio = (id: string) => {
    const stream = streams.find(s => s.id === id);

    // Track solo audio
    if (stream) {
      amplitude.track('Solo Audio Activated', {
        platform: stream.platform,
        streamCount: streams.length,
      });
    }

    setStreams(streams.map(s => ({
      ...s,
      isMuted: s.id !== id, // Mute all except the selected one
    })));
  };

  const handleStreamClick = (id: string) => {
    soloAudio(id);
  };

  const copyStreamUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Calculate total viewers
  const totalViewers = streams.reduce((total, stream) => total + (stream.viewerCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] animate-fade-in relative">
      {/* Sidebar */}
      <aside className={`sidebar animate-slide-up transition-transform duration-300 ${!sidebarVisible ? '-translate-x-full absolute' : 'translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 animate-scale-in">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg relative">
            <Image
              src="/logo.jpg"
              alt="Entrega Newba"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Entrega Newba</h1>
            <p className="text-xs text-[hsl(var(--subtle-foreground))]">Watch smarter, not harder</p>
          </div>
        </div>

        {/* Total Viewers Counter */}
        {streams.length > 0 && (
          <div className="glass-card p-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(217_91%_60%)] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Viewers</p>
                  <p className="text-lg font-bold gradient-text">{formatViewerCount(totalViewers)}</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
          </div>
        )}

        <Separator className="bg-[hsl(var(--border))]" />

        {/* Add Stream Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[hsl(var(--primary))]" />
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Add Stream</h2>
          </div>

          <div className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Paste stream URL..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              className="focus-ring bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))] text-sm h-11"
            />

            <Button
              onClick={addStream}
              className="gradient-button h-11 text-sm font-medium relative z-10"
              disabled={!inputUrl.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stream
            </Button>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/20 text-purple-400">
                <TwitchIcon className="w-3 h-3 mr-1" />
                Twitch
              </Badge>
              <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500/20 text-red-400">
                <Youtube className="w-3 h-3 mr-1" />
                YouTube
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                <Video className="w-3 h-3 mr-1" />
                Kick
              </Badge>
            </div>

            {/* Share Button in Sidebar */}
            {streams.length > 0 && (
              <Button
                onClick={shareSetup}
                variant="outline"
                className="w-full h-11 text-sm font-medium border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-elevated))] hover:border-[hsl(var(--border-strong))] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Separator className="bg-[hsl(var(--border))]" />

        {/* Layout Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-[hsl(var(--primary))]" />
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Layout</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(layoutConfigs) as LayoutType[]).map((layoutType) => {
              const config = layoutConfigs[layoutType];
              const Icon = config.icon;
              const isActive = layout === layoutType;

              return (
                <Button
                  key={layoutType}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLayout(layoutType)}
                  className={`h-20 flex flex-col gap-1 transition-all ${
                    isActive
                      ? 'bg-[hsl(217_91%_60%)] text-white border-0 shadow-lg'
                      : 'bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))]'
                  }`}
                  title={config.description}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
                    {config.label}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[hsl(var(--subtle-foreground))]'}`}>
                    {config.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-[hsl(var(--border))]" />

        {/* Active Streams List */}
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[hsl(var(--primary))]" />
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Active Streams</h2>
            </div>
            <Badge variant="secondary" className="bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-0 text-xs font-bold">
              {streams.length}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {streams.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--surface-elevated))] flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-6 h-6 text-[hsl(var(--subtle-foreground))]" />
                </div>
                <p className="text-xs text-[hsl(var(--subtle-foreground))]">No streams yet</p>
              </div>
            ) : (
              streams.map((stream, index) => (
                <div
                  key={stream.id}
                  className="glass-card p-3 group animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getPlatformColor(stream.platform)} flex items-center justify-center shadow-sm`}>
                          {getPlatformIcon(stream.platform)}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-[hsl(var(--border))]">
                          {stream.platform}
                        </Badge>
                        {stream.viewerCount !== undefined && (
                          <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--primary))]">
                            <Eye className="w-3 h-3" />
                            <span className="font-semibold">{formatViewerCount(stream.viewerCount)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {stream.channelName || stream.videoId || stream.url}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStream(stream.id)}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[hsl(var(--border))]">
          <p className="text-[10px] text-[hsl(var(--subtle-foreground))] text-center">
            Entrega Newba © 2025
          </p>
          <p className="text-[9px] text-[hsl(var(--subtle-foreground))] text-center mt-1">
            Do newba ao pro
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto transition-all duration-300">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="mb-8 lg:mb-12 animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              {/* Toggle Sidebar Button */}
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] hover:border-[hsl(var(--muted-foreground))] transition-all cursor-pointer group"
                title={sidebarVisible ? 'Esconder sidebar' : 'Mostrar sidebar'}
              >
                {sidebarVisible ? (
                  <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                )}
              </button>
              <div className="w-2 h-8 bg-[hsl(217_91%_60%)] rounded-full" />
              <h1 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
                Suas Streams
              </h1>
              {/* Share Setup Button */}
              {streams.length > 0 && (
                <button
                  onClick={shareSetup}
                  className="ml-auto w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] hover:border-[hsl(var(--muted-foreground))] transition-all cursor-pointer group"
                  title="Compartilhar setup"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Share2 className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                  )}
                </button>
              )}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] ml-5">
              Assista múltiplas lives simultaneamente com controle total
            </p>
          </div>

          {/* Stream Grid */}
          {streams.length === 0 ? (
            <div className="empty-state glass-card animate-scale-in min-h-[500px]">
              <div className="w-20 h-20 rounded-2xl bg-[hsl(217_91%_60%)] flex items-center justify-center mb-6 shadow-lg">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">
                Pronto para assistir?
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-8">
                Adicione sua primeira stream usando a sidebar. Cole uma URL da Twitch, YouTube ou Kick para começar.
              </p>
              <div className="flex flex-col gap-3 text-left max-w-sm">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[hsl(217_91%_60%)]">1</span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Copy a stream URL from your favorite platform
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[hsl(217_91%_60%)]">2</span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Paste it in the sidebar and click "Add Stream"
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[hsl(217_91%_60%)]">3</span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Choose your layout and enjoy multiple streams at once
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`layout-${layout} animate-fade-in`}>
              {streams.map((stream, index) => {
                const progress = unmutingProgress[stream.id] || 0;
                const isHovering = hoveringStream === stream.id;

                return (
                  <ContextMenu key={stream.id}>
                    <ContextMenuTrigger asChild>
                      <div
                        className="stream-container animate-scale-in group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onMouseEnter={() => handleStreamHover(stream.id, true)}
                        onMouseLeave={() => handleStreamHover(stream.id, false)}
                        onClick={() => handleStreamClick(stream.id)}
                      >
                        <iframe
                          key={`${stream.id}-${stream.isMuted}`}
                          src={getPlatformEmbed(stream.url, stream.platform, stream.isMuted)}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; encrypted-media; picture-in-picture"
                        />

                        {/* Stream Overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <div className={`px-2.5 py-1.5 rounded-lg bg-gradient-to-br ${getPlatformColor(stream.platform)} backdrop-blur-xl shadow-lg flex items-center gap-2`}>
                            {getPlatformIcon(stream.platform)}
                            <span className="text-xs font-semibold text-white capitalize">
                              {stream.platform}
                            </span>
                          </div>
                        </div>

                        {/* Audio Control Overlay */}
                        {stream.isMuted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                            <div className="relative flex items-center justify-center">
                              {/* Circular Progress */}
                              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="hsl(var(--border))"
                                  strokeWidth="4"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="4"
                                  strokeDasharray={`${2 * Math.PI * 45}`}
                                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                  strokeLinecap="round"
                                  className="transition-all duration-75 ease-linear"
                                  style={{
                                    filter: 'drop-shadow(0 0 8px hsl(var(--primary)))'
                                  }}
                                />
                              </svg>

                              {/* Icon in center */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-[hsl(217_91%_60%)] flex items-center justify-center shadow-lg">
                                  <VolumeX className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            </div>

                            {/* Text hint */}
                            <div className="absolute bottom-8 left-0 right-0 text-center">
                              <p className="text-sm font-medium text-white drop-shadow-lg">
                                Hold to unmute
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Unmuted indicator */}
                        {!stream.isMuted && (
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMute(stream.id);
                              }}
                              className="w-10 h-10 rounded-full bg-[hsl(217_91%_60%)] flex items-center justify-center shadow-lg hover:scale-110 hover:bg-[hsl(217_91%_55%)] transition-transform cursor-pointer"
                            >
                              <Volume2 className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-56 glass-card border-[hsl(var(--border))]">
                      <ContextMenuItem
                        onClick={() => soloAudio(stream.id)}
                        className="flex items-center gap-2 cursor-pointer focus:bg-[hsl(var(--surface-elevated))]"
                      >
                        <Headphones className="w-4 h-4 text-[hsl(var(--primary))]" />
                        <span>Solo Audio</span>
                      </ContextMenuItem>

                      <ContextMenuItem
                        onClick={() => toggleMute(stream.id)}
                        className="flex items-center gap-2 cursor-pointer focus:bg-[hsl(var(--surface-elevated))]"
                      >
                        {stream.isMuted ? (
                          <Volume2 className="w-4 h-4 text-[hsl(var(--primary))]" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-[hsl(var(--primary))]" />
                        )}
                        <span>{stream.isMuted ? 'Unmute' : 'Mute'}</span>
                      </ContextMenuItem>

                      <ContextMenuSeparator className="bg-[hsl(var(--border))]" />

                      <ContextMenuItem
                        onClick={() => copyStreamUrl(stream.url)}
                        className="flex items-center gap-2 cursor-pointer focus:bg-[hsl(var(--surface-elevated))]"
                      >
                        <Copy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <span>Copy URL</span>
                      </ContextMenuItem>

                      <ContextMenuItem
                        onClick={() => openInNewTab(stream.url)}
                        className="flex items-center gap-2 cursor-pointer focus:bg-[hsl(var(--surface-elevated))]"
                      >
                        <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <span>Open in New Tab</span>
                      </ContextMenuItem>

                      <ContextMenuSeparator className="bg-[hsl(var(--border))]" />

                      <ContextMenuItem
                        onClick={() => removeStream(stream.id)}
                        className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Stream</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Share Suggestion Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md glass-card border-[hsl(var(--border))]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[hsl(var(--primary))]" />
              Compartilhe seu setup!
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
              Você acabou de criar uma combinação de streams. Quer compartilhar com seus amigos?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                shareSetup();
                setShowShareModal(false);
              }}
              className="gradient-button h-11 text-sm font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Agora
            </Button>
            <Button
              onClick={() => setShowShareModal(false)}
              variant="outline"
              className="h-11 text-sm border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-elevated))] cursor-pointer"
            >
              Agora não
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
