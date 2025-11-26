'use client';

import { useState, useEffect, useRef } from 'react';
import { useTVNavigation, isTVDevice } from '@/hooks/use-tv-navigation';
import Image from 'next/image';
import Link from 'next/link';
import amplitude from '@/amplitude';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StreamerCommandPalette, type CommandPaletteRef } from '@/components/streamer-command-palette';
import { ChatPanel } from '@/components/chat/chat-panel';
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
  Play,
  Menu,
  MessageCircle,
  BarChart3,
  PictureInPicture,
} from 'lucide-react';
import EventInfoModal from '@/components/event-info-modal';

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

type LayoutType = 'grid' | 'pip' | 'main-side';

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
      return `https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}&autoplay=true&muted=${isMuted}`;
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
  'grid': { icon: Grid2x2, label: 'Grid', description: 'Equal grid' },
  'pip': { icon: Maximize2, label: 'PiP', description: '1 main + small' },
  'main-side': { icon: Columns2, label: 'Sidebar', description: '1 main + side' },
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

interface TopStreamer {
  id: string;
  username: string;
  displayName: string;
  platform: 'twitch' | 'youtube' | 'kick';
  avatarUrl: string;
  currentViewers: number;
  currentTitle: string;
  url: string;
}

export default function HomePage() {
  // TV Navigation Support
  useTVNavigation();

  const commandPaletteRef = useRef<CommandPaletteRef>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [hoveringStream, setHoveringStream] = useState<string | null>(null);
  const [unmutingProgress, setUnmutingProgress] = useState<Record<string, number>>({});
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    // Initialize sidebar as hidden on mobile devices
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true; // Default to visible for SSR
  });
  const [chatPanelVisible, setChatPanelVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [topStreamers, setTopStreamers] = useState<TopStreamer[]>([]);
  const [loadingTopStreamers, setLoadingTopStreamers] = useState(false);
  const [selectedStreamers, setSelectedStreamers] = useState<Set<string>>(new Set());
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [pipThumbnailSize, setPipThumbnailSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [pipStreams, setPipStreams] = useState<Set<string>>(new Set());
  const pipWindowsRef = useRef<Map<string, Window>>(new Map());

  // Drag and drop states
  const [draggedStreamIndex, setDraggedStreamIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // TV detection
  const [isTV, setIsTV] = useState(false);

  // Detect mobile and orientation
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768;
      const landscape = width > height;

      setIsMobile(mobile);
      setIsLandscape(landscape);

      // Detect TV
      setIsTV(isTVDevice());

      // Auto-hide sidebar on mobile portrait
      if (mobile && !landscape && sidebarVisible) {
        setSidebarVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

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
    if (streams.length > 0 && layoutConfigs[layout]) {
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

  // Load from URL params or pre-load Major streams on mount
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

        // Track shared link opened with detailed info
        const channels = loadedStreams.map(s => s.channelName || s.videoId || 'custom').join(', ');
        const platformCounts = loadedStreams.reduce((acc, s) => {
          acc[s.platform] = (acc[s.platform] || 0) + 1;
          return acc;
        }, {} as Record<Platform, number>);

        amplitude.track('Shared Setup Opened', {
          streamCount: loadedStreams.length,
          layout: layoutParam || 'grid',
          platforms: loadedStreams.map(s => s.platform),
          channels,
          platformCounts,
          shareUrl: window.location.href,
          streamsParam,
        });

        // Clear URL params after loading
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        // Pre-load official Major Budapest 2025 streams
        const isMobileDevice = window.innerWidth < 768;

        const majorStreams: Stream[] = [
          {
            id: 'official-stream-1',
            url: 'https://www.youtube.com/watch?v=nQcHGCNuVMk',
            platform: 'youtube',
            title: 'Major Budapest 2025 - Official Stream',
            isMuted: false,
            videoId: 'nQcHGCNuVMk',
          },
          {
            id: 'official-stream-2',
            url: 'https://www.youtube.com/watch?v=qIkVpLktGms',
            platform: 'youtube',
            title: 'Major Budapest 2025 - Official Stream 2',
            isMuted: true,
            videoId: 'qIkVpLktGms',
          },
        ];

        setStreams(majorStreams);
        setLayout(isMobileDevice ? 'grid' : 'pip');
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
      method: 'url_input',
    });

    setStreams([...streams, newStream]);
    setInputUrl('');

    // Show share modal when adding 2nd stream
    if (streams.length === 1) {
      setTimeout(() => setShowShareModal(true), 500);
    }
  };

  const addStreamFromCommandPalette = (streamer: any) => {
    const newStream: Stream = {
      id: Date.now().toString(),
      url: streamer.url,
      platform: streamer.platform,
      isMuted: streams.length > 0,
      channelName: streamer.username,
      viewerCount: streamer.currentViewers,
      isLive: streamer.isLive,
    };

    // Track stream addition from command palette
    amplitude.track('Stream Added', {
      platform: streamer.platform,
      streamCount: streams.length + 1,
      channelName: streamer.username,
      method: 'command_palette',
      was_live: streamer.isLive,
      viewers: streamer.currentViewers,
    });

    setStreams([...streams, newStream]);

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

  // Fetch top streamers when no streams are added
  useEffect(() => {
    if (streams.length === 0) {
      setLoadingTopStreamers(true);
      fetch('/api/streamers/search')
        .then(res => res.json())
        .then(data => {
          setTopStreamers((data.results || []).slice(0, 6));
          setLoadingTopStreamers(false);
        })
        .catch(error => {
          console.error('Error fetching top streamers:', error);
          setLoadingTopStreamers(false);
        });
    } else {
      // Reset selection when streams are added
      setSelectedStreamers(new Set());
    }
  }, [streams.length]);

  const toggleStreamerSelection = (streamerId: string) => {
    setSelectedStreamers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(streamerId)) {
        newSet.delete(streamerId);
      } else {
        newSet.add(streamerId);
      }
      return newSet;
    });
  };

  const addSelectedStreamers = () => {
    const streamersToAdd = topStreamers.filter(s => selectedStreamers.has(s.id));

    // Create all new streams at once
    const newStreams = streamersToAdd.map((streamer, index) => ({
      id: Date.now().toString() + '-' + index,
      url: streamer.url,
      platform: streamer.platform,
      isMuted: streams.length > 0 || index > 0, // First one unmuted if no existing streams
      channelName: streamer.username,
      viewerCount: streamer.currentViewers,
      isLive: true,
    }));

    // Batch update streams state
    setStreams([...streams, ...newStreams]);

    // Track each stream addition
    streamersToAdd.forEach((streamer, index) => {
      amplitude.track('Stream Added', {
        platform: streamer.platform,
        streamCount: streams.length + index + 1,
        channelName: streamer.username,
        method: 'empty_state_selection',
        was_live: true,
        viewers: streamer.currentViewers,
      });
    });

    amplitude.track('Multiple Streamers Added from Empty State', {
      count: streamersToAdd.length,
      platforms: streamersToAdd.map(s => s.platform),
    });

    setSelectedStreamers(new Set());

    // Show share modal when adding streams (if we now have 2+ total)
    if (streams.length === 0 && streamersToAdd.length >= 2) {
      setTimeout(() => setShowShareModal(true), 500);
    } else if (streams.length === 1 && streamersToAdd.length >= 1) {
      setTimeout(() => setShowShareModal(true), 500);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Drag and Drop Handlers
  // Picture-in-Picture functionality
  const togglePictureInPicture = async (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    try {
      // If already in PiP, close it
      const existingWindow = pipWindowsRef.current.get(streamId);
      if (existingWindow) {
        existingWindow.close();
        pipWindowsRef.current.delete(streamId);
        setPipStreams(prev => {
          const newSet = new Set(prev);
          newSet.delete(streamId);
          return newSet;
        });
        return;
      }

      // Calculate position for new window
      const windowCount = pipWindowsRef.current.size;
      const offset = windowCount * 50;
      const width = 800;
      const height = 450;
      const left = window.screen.width - width - 50 - offset;
      const top = 50 + offset;

      // Check if Document Picture-in-Picture API is supported AND no PiP window exists yet
      // Note: Document PiP API only allows ONE window at a time
      if ('documentPictureInPicture' in window && pipWindowsRef.current.size === 0) {
        try {
          // @ts-ignore - Document Picture-in-Picture API
          const pipWindow = await window.documentPictureInPicture.requestWindow({
            width,
            height,
          });

          // Store the window reference
          pipWindowsRef.current.set(streamId, pipWindow);
          setPipStreams(prev => new Set(prev).add(streamId));

          // Copy styles to PiP window
          const styleSheets = Array.from(document.styleSheets);
          styleSheets.forEach((styleSheet) => {
            try {
              const cssRules = Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join('');
              const style = document.createElement('style');
              style.textContent = cssRules;
              pipWindow.document.head.appendChild(style);
            } catch (e) {
              // Handle CORS errors for external stylesheets
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = styleSheet.href || '';
              pipWindow.document.head.appendChild(link);
            }
          });

          // Create iframe in PiP window
          const container = pipWindow.document.createElement('div');
          container.style.cssText = 'width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #000;';

          const iframe = pipWindow.document.createElement('iframe');
          iframe.src = getPlatformEmbed(stream.url, stream.platform, stream.isMuted);
          iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
          iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope';
          iframe.allowFullscreen = true;

          container.appendChild(iframe);
          pipWindow.document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden;';
          pipWindow.document.body.appendChild(container);

          // Handle window close
          pipWindow.addEventListener('pagehide', () => {
            pipWindowsRef.current.delete(streamId);
            setPipStreams(prev => {
              const newSet = new Set(prev);
              newSet.delete(streamId);
              return newSet;
            });
          });

          amplitude.track('Picture-in-Picture Opened', {
            platform: stream.platform,
            channelName: stream.channelName || stream.videoId,
            activePipWindows: pipWindowsRef.current.size,
            method: 'document_pip',
          });

          return;
        } catch (error) {
          console.error('Document PiP failed, falling back to popup:', error);
          // Fall through to popup window fallback
        }
      }

      // Fallback or additional windows: Use regular popup windows
      const newWindow = window.open(
        '',
        `PiP Stream ${streamId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,menubar=no,toolbar=no,location=no,status=no`
      );

      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${stream.channelName || stream.videoId || 'Stream'} - PiP</title>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; background: #000; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe 
                src="${getPlatformEmbed(stream.url, stream.platform, stream.isMuted)}"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
                allowfullscreen
              ></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();

        // Store window reference
        pipWindowsRef.current.set(streamId, newWindow);
        setPipStreams(prev => new Set(prev).add(streamId));

        // Handle window close
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);
            pipWindowsRef.current.delete(streamId);
            setPipStreams(prev => {
              const newSet = new Set(prev);
              newSet.delete(streamId);
              return newSet;
            });
          }
        }, 1000);

        amplitude.track('Picture-in-Picture Opened', {
          platform: stream.platform,
          channelName: stream.channelName || stream.videoId,
          activePipWindows: pipWindowsRef.current.size,
          method: 'popup_window',
        });
      }
    } catch (error) {
      console.error('Error opening Picture-in-Picture:', error);

      // Final fallback: open original URL
      const windowCount = pipWindowsRef.current.size;
      const offset = windowCount * 50;
      const width = 800;
      const height = 450;
      const left = window.screen.width - width - 50 - offset;
      const top = 50 + offset;

      const newWindow = window.open(
        stream.url,
        `Stream ${streamId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes`
      );

      if (newWindow) {
        pipWindowsRef.current.set(streamId, newWindow);
        setPipStreams(prev => new Set(prev).add(streamId));
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStreamIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStreamIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedStreamIndex === null || draggedStreamIndex === dropIndex) {
      setDraggedStreamIndex(null);
      setDropTargetIndex(null);
      return;
    }

    // Swap streams
    const newStreams = [...streams];
    [newStreams[draggedStreamIndex], newStreams[dropIndex]] =
      [newStreams[dropIndex], newStreams[draggedStreamIndex]];

    setStreams(newStreams);
    setDraggedStreamIndex(null);
    setDropTargetIndex(null);

    amplitude.track('Streams Reordered', {
      from: draggedStreamIndex,
      to: dropIndex,
    });
  };

  const handleDragEnd = () => {
    setDraggedStreamIndex(null);
    setDropTargetIndex(null);
  };

  // Calculate total viewers
  const totalViewers = streams.reduce((total, stream) => total + (stream.viewerCount || 0), 0);

  const renderGrid = () => (
    <div className={`layout-${layout} ${layout === 'pip' ? `pip-${pipThumbnailSize}` : ''} animate-fade-in ${!sidebarVisible && !isMobile ? 'h-[100vh] gap-0' : ''}`}>
      {streams.map((stream, index) => {
        const progress = unmutingProgress[stream.id] || 0;
        const isHovering = hoveringStream === stream.id;

        return (
          <div
            key={stream.id}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`stream-container group ${draggedStreamIndex === index ? 'opacity-50' : ''
              } ${dropTargetIndex === index ? 'ring-4 ring-[hsl(var(--primary))] ring-offset-2' : ''
              }`}
            style={{
              opacity: draggedStreamIndex === index ? 0.5 : 1,
              visibility: 'visible',
              cursor: 'move',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              maxWidth: isMobile ? '370px' : '100%',
            }}
            onMouseEnter={() => handleStreamHover(stream.id, true)}
            onMouseLeave={() => handleStreamHover(stream.id, false)}
            onClick={() => handleStreamClick(stream.id)}
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


            {/* Mute/Unmute Toggle Button */}
            {stream.isMuted && isHovering && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(stream.id);
                  }}
                  className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:scale-110 hover:bg-red-500 transition-transform cursor-pointer"
                >
                  <VolumeX className="w-5 h-5 text-white" />
                </button>
              </div>
            )}


            {/* Unmuted indicator */}
            {!stream.isMuted && (
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
              >
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

            {/* Picture-in-Picture Button */}
            <div
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ pointerEvents: draggedStreamIndex !== null ? 'none' : 'auto' }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePictureInPicture(stream.id);
                }}
                className={`w-10 h-10 rounded-full ${pipStreams.has(stream.id)
                  ? 'bg-green-600 hover:bg-green-500'
                  : 'bg-black/60 hover:bg-black/80'
                  } backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer`}
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Command Palette for adding streamers */}
      <StreamerCommandPalette
        ref={commandPaletteRef}
        onSelectStreamer={addStreamFromCommandPalette}
        existingStreams={streams.map(s => ({
          platform: s.platform,
          channelName: s.channelName || '',
        }))}
      />

      <div className="flex h-screen bg-[hsl(var(--background))] animate-fade-in relative max-w-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/major-bg.png"
            alt="Background"
            fill
            className="object-cover opacity-25"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/80 to-black/60" />
        </div>
        {/* Mobile backdrop */}
        {isMobile && sidebarVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          sidebar animate-slide-up transition-all duration-300
          ${!sidebarVisible ? '-translate-x-full w-0 p-0 border-none overflow-hidden' : 'translate-x-0'}
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-full md:w-80' : 'relative'}
        `}>
          {/* Header & Logo Section */}
          <div className="p-4 border-b border-[hsl(var(--border))] relative">
            {/* Close button - Mobile only */}
            {isMobile && (
              <button
                onClick={() => setSidebarVisible(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] transition-all"
                title="Fechar sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
            )}

            <Link href="/" className="flex flex-col gap-3">
              {/* Major Logo */}
              <img
                src="/major-budapest-2025.png"
                alt="Major Budapest 2025"
                className="w-3/4 h-auto mx-auto drop-shadow-lg"
              />
            </Link>
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

          {/* Add Stream Shortcut */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => commandPaletteRef.current?.open()}
              variant="outline"
              className="w-full h-11 text-sm font-medium border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-elevated))] hover:border-[hsl(var(--border-strong))] justify-between px-4"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Stream
              </span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))] opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

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

          {/* Top Live Streams - só mostra quando não há streams adicionados */}
          {streams.length === 0 && (
            <>
              <Separator className="bg-[hsl(var(--border))]" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Top Lives</h2>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {topStreamers.length}
                  </Badge>
                </div>

                {loadingTopStreamers ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="glass-card p-3 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[hsl(var(--border))]" />
                          <div className="flex-1">
                            <div className="h-4 bg-[hsl(var(--border))] rounded w-3/4 mb-2" />
                            <div className="h-3 bg-[hsl(var(--border))] rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {topStreamers.map((streamer) => (
                      <button
                        key={streamer.id}
                        onClick={() => {
                          addStreamFromCommandPalette(streamer);
                          amplitude.track('Top Streamer Selected', {
                            platform: streamer.platform,
                            username: streamer.username,
                            viewers: streamer.currentViewers,
                          });
                        }}
                        className="glass-card p-3 hover:bg-[hsl(var(--surface-elevated))] transition-all duration-200 text-left group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Image
                              src={streamer.avatarUrl}
                              alt={streamer.displayName}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover"
                              unoptimized
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--surface-elevated))] flex items-center justify-center border-2 border-[hsl(var(--background))]">
                              {streamer.platform === 'twitch' && <TwitchIcon className="w-3 h-3 text-purple-400" />}
                              {streamer.platform === 'youtube' && <Youtube className="w-3 h-3 text-red-400" />}
                              {streamer.platform === 'kick' && <Video className="w-3 h-3 text-green-400" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                                {streamer.displayName}
                              </p>
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                              {streamer.currentTitle || 'Live agora'}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Eye className="w-3 h-3 text-red-500" />
                              <span className="text-xs font-medium text-red-500">
                                {formatViewerCount(streamer.currentViewers)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Separator className="bg-[hsl(var(--border))]" />

          {/* Layout Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-[hsl(var(--primary))]" />
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Layout</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
                    className={`h-20 flex flex-col gap-1 transition-all ${isActive
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

          {/* PIP Thumbnail Size - Only show when PIP layout is active */}
          {layout === 'pip' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[hsl(var(--primary))]" />
                <h3 className="text-xs font-semibold text-[hsl(var(--foreground))]">Thumbnail Size</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={pipThumbnailSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPipThumbnailSize(size)}
                    className={`h-10 text-xs capitalize transition-all ${pipThumbnailSize === size
                      ? 'bg-[hsl(217_91%_60%)] text-white border-0'
                      : 'bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))]'
                      }`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}





        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 relative z-10 
          ${chatPanelVisible ? (isMobile ? 'mr-80' : 'mr-96') : ''}
          ${!sidebarVisible && !isMobile ? 'p-0' : 'p-4 lg:p-6'}
        `}>
          <div className={`${!sidebarVisible && !isMobile ? 'h-full w-full' : 'max-w-[1800px] mx-auto'}`}>
            {/* Hover Trigger Area for Auto-Hide Header */}
            {!sidebarVisible && !isMobile && (
              <div className="fixed top-0 left-0 right-0 h-4 z-50 peer" />
            )}

            {/* Header */}
            <div className={`
              animate-slide-up relative z-20 transition-all duration-300 ease-out
              ${!sidebarVisible && !isMobile
                ? 'fixed top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-50 transform -translate-y-full hover:translate-y-0 peer-hover:translate-y-0'
                : 'mb-4'}
            `}>
              <div className="flex items-center gap-3">
                {/* Toggle Sidebar Button - Hamburger on mobile, chevron on desktop */}
                <button
                  onClick={toggleSidebar}
                  className={`
                    ${isMobile && !sidebarVisible
                      ? 'fixed top-4 left-4 z-30 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
                      : 'w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))]'
                    }
                    flex items-center justify-center 
                    hover:scale-110 transition-all cursor-pointer group
                  `}
                  title={sidebarVisible ? 'Esconder sidebar' : 'Mostrar sidebar'}
                >
                  {isMobile && !sidebarVisible ? (
                    <Menu className="w-6 h-6 text-white" />
                  ) : sidebarVisible ? (
                    <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                  )}
                </button>
                {/* Share Setup Button */}
                {streams.length > 0 && (
                  <>
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

                    {/* Event Info Button */}
                    <button
                      onClick={() => setEventInfoModalOpen(true)}
                      className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] hover:border-[hsl(var(--muted-foreground))] transition-all cursor-pointer group"
                      title="Event Info"
                    >
                      <BarChart3 className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                    </button>

                    {/* Chat Button */}
                    <button
                      onClick={() => setChatPanelVisible(!chatPanelVisible)}
                      className="ml-2 w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] hover:border-[hsl(var(--muted-foreground))] transition-all cursor-pointer group"
                      title="Toggle chat"
                    >
                      <MessageCircle className={`w-5 h-5 ${chatPanelVisible ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]'}`} />
                    </button>
                  </>
                )}
                {/* Download APK Link - Only on TV */}
                {isTV && (
                  <a
                    href="https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk"
                    className="ml-2 px-4 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 border-0 flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all cursor-pointer shadow-md hover:shadow-lg text-white font-medium text-sm"
                    title="Baixar app para Android TV"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    <span className="hidden md:inline">TV</span>
                  </a>
                )}
              </div>
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
                  Escolha uma das opções abaixo para começar a assistir suas lives favoritas
                </p>

                {/* Top 3 Lives Preview */}
                <div className="mb-8 w-full max-w-md">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Top Lives Agora</h3>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {loadingTopStreamers ? 'Carregando...' : selectedStreamers.size > 0 ? `${selectedStreamers.size} selecionado${selectedStreamers.size > 1 ? 's' : ''}` : 'Selecione para assistir'}
                    </Badge>
                  </div>
                  <div className="flex gap-4 justify-center mb-4">
                    {loadingTopStreamers ? (
                      // Skeleton loading state
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                            <div className="relative">
                              <div className="w-20 h-20 rounded-xl bg-[hsl(var(--border))] animate-pulse" />
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[hsl(var(--border))]" />
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[hsl(var(--border))] w-12 h-4" />
                            </div>
                            <div className="w-16 h-3 bg-[hsl(var(--border))] rounded" />
                          </div>
                        ))}
                      </>
                    ) : topStreamers.length > 0 ? (
                      topStreamers.slice(0, 3).map((streamer, index) => {
                        const isSelected = selectedStreamers.has(streamer.id);
                        return (
                          <button
                            key={streamer.id}
                            onClick={() => {
                              toggleStreamerSelection(streamer.id);
                              amplitude.track('Empty State Streamer Toggled', {
                                platform: streamer.platform,
                                username: streamer.username,
                                selected: !isSelected,
                                position: index + 1,
                              });
                            }}
                            className={`group flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${isSelected ? 'scale-105' : ''
                              }`}
                          >
                            <div className="relative">
                              <div className={`w-20 h-20 rounded-xl overflow-hidden ring-2 transition-all shadow-lg ${isSelected
                                ? 'ring-[hsl(var(--primary))] ring-4'
                                : 'ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary))]'
                                }`}>
                                <Image
                                  src={streamer.avatarUrl}
                                  alt={streamer.displayName}
                                  width={80}
                                  height={80}
                                  className={`object-cover w-full h-full transition-all ${isSelected ? 'brightness-90' : 'group-hover:brightness-95'
                                    }`}
                                  unoptimized
                                />
                              </div>
                              {/* Checkbox indicator */}
                              <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${isSelected
                                ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] scale-100'
                                : 'bg-[hsl(var(--background))] border-[hsl(var(--border))] scale-0 group-hover:scale-100'
                                }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[hsl(var(--background))] flex items-center justify-center border-2 border-[hsl(var(--border))] shadow-sm">
                                {streamer.platform === 'twitch' && <TwitchIcon className="w-3 h-3 text-purple-400" />}
                                {streamer.platform === 'youtube' && <Youtube className="w-3 h-3 text-red-400" />}
                                {streamer.platform === 'kick' && <Video className="w-3 h-3 text-green-400" />}
                              </div>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-500 flex items-center gap-1 shadow-sm">
                                <Eye className="w-2.5 h-2.5 text-white" />
                                <span className="text-[10px] font-bold text-white">
                                  {formatViewerCount(streamer.currentViewers)}
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className={`text-xs font-semibold transition-colors truncate max-w-[80px] ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]'
                                }`}>
                                {streamer.displayName}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      // Mensagem quando não há streamers disponíveis
                      <div className="text-center py-4">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Nenhuma live disponível no momento
                        </p>
                      </div>
                    )}
                  </div>
                  {!loadingTopStreamers && selectedStreamers.size > 0 && (
                    <Button
                      onClick={addSelectedStreamers}
                      className="gradient-button w-full h-11 text-sm font-medium animate-scale-in"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Assistir {selectedStreamers.size} {selectedStreamers.size === 1 ? 'Streamer' : 'Streamers'}
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-3 text-left max-w-sm">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[hsl(217_91%_60%)]">1</span>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      <span className="font-semibold text-[hsl(var(--foreground))]">Clique nos "Top Lives"</span> acima ou na sidebar para adicionar streamers populares
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[hsl(217_91%_60%)]">2</span>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      <span className="font-semibold text-[hsl(var(--foreground))]">Use Cmd+K</span> ou clique no input para buscar qualquer streamer (Twitch, YouTube, Kick)
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[hsl(217_91%_60%)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[hsl(217_91%_60%)]">3</span>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))]">
                      Ou <span className="font-semibold text-[hsl(var(--foreground))]">cole uma URL</span> diretamente no input e clique em "Add Stream"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              renderGrid()
            )}
          </div>
        </main>

        {/* Share Suggestion Modal */}
        < Dialog open={showShareModal} onOpenChange={setShowShareModal} >
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
        </Dialog >

      </div >

      {/* Chat Panel */}
      <ChatPanel
        streams={streams.filter(s => s.platform !== 'custom') as Array<{
          platform: 'twitch' | 'youtube' | 'kick';
          channelName?: string;
          videoId?: string;
        }>}
        isVisible={chatPanelVisible}
        onToggle={() => setChatPanelVisible(!chatPanelVisible)}
        compact={isMobile}
      />

      {/* Event Info Modal */}
      <EventInfoModal
        externalId="8504"
        open={eventInfoModalOpen}
        onClose={() => setEventInfoModalOpen(false)}
      />
    </>
  );
}
