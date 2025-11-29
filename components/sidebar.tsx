import { type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import amplitude from '@/amplitude';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CommandPaletteRef } from '@/components/streamer-command-palette';
import { SidebarHeader } from '@/components/sidebar-header';
import {
    Plus,
    Layout,
    Youtube,
    Twitch as TwitchIcon,
    Video,
    Eye,
    Users,
    ChevronLeft,
    Maximize2,
    Share2,
    Check,
    X,
} from 'lucide-react';

// Helper function
const formatViewerCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
};

// Type imports
export type LayoutType = 'single' | 'triple' | 'grid' | 'cinema';

export interface TopStreamer {
    id: string;
    username: string;
    displayName: string;
    platform: 'twitch' | 'youtube' | 'kick';
    avatarUrl: string;
    currentViewers: number;
    currentTitle: string;
    url: string;
}

export interface LayoutConfig {
    icon: any;
    label: string;
    description: string;
}

export interface SidebarProps {
    // State
    streams: any[];
    layout: LayoutType;
    sidebarVisible: boolean;
    isMobile: boolean;
    topStreamers: TopStreamer[];
    loadingTopStreamers: boolean;
    copied: boolean;
    totalViewers: number;

    // Callbacks
    onToggleSidebar: () => void;
    onAddStream: (streamer: any) => void;
    onRemoveStream?: (id: string) => void;
    onLayoutChange: (layout: LayoutType) => void;
    onShareSetup: () => void;

    // Refs
    commandPaletteRef: RefObject<CommandPaletteRef | null>;

    // Layout configs
    layoutConfigs: Record<LayoutType, LayoutConfig>;

    // Optional customization
    headerContent?: React.ReactNode;
    eventLogo?: string;
}

export function Sidebar({
    streams,
    layout,
    sidebarVisible,
    isMobile,
    topStreamers,
    loadingTopStreamers,
    copied,
    totalViewers,
    onToggleSidebar,
    onAddStream,
    onRemoveStream,
    onLayoutChange,
    onShareSetup,
    commandPaletteRef,
    layoutConfigs,
    headerContent,
    eventLogo,
}: SidebarProps) {
    return (
        <aside
            className={`
        sidebar animate-slide-up transition-all duration-300 flex flex-col
        ${!sidebarVisible ? '-translate-x-full w-0 p-0 border-none overflow-hidden' : 'translate-x-0'}
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-full md:w-80' : 'relative h-screen'}
      `}
        >
            {/* Header & Logo Section */}
            <div className="p-4 border-b border-[hsl(var(--border))] relative flex-shrink-0">
                {headerContent ? (
                    <>
                        {isMobile && (
                            <button
                                onClick={onToggleSidebar}
                                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] transition-all"
                                title="Fechar sidebar"
                            >
                                <ChevronLeft className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            </button>
                        )}
                        {headerContent}
                    </>
                ) : (
                    <div className="flex flex-col gap-3">
                        {eventLogo && (
                            <Link href="/" className="block hover:opacity-90 transition-opacity">
                                <img
                                    src={eventLogo}
                                    alt="Event Logo"
                                    className="w-3/4 h-auto mx-auto drop-shadow-lg"
                                />
                            </Link>
                        )}
                        <SidebarHeader
                            isMobile={isMobile}
                            onClose={onToggleSidebar}
                        />
                    </div>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 p-4">
                {/* Total Viewers Counter */}
                {
                    streams.length > 0 && (
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
                )
            }

            {/* Active Streams List */}
            {
                streams.length > 0 && onRemoveStream && (
                    <>
                        <Separator className="bg-[hsl(var(--border))]" />

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Streams Ativas</h2>
                                <Badge variant="outline" className="text-xs">
                                    {streams.length}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {streams.map((stream, index) => (
                                    <div
                                        key={stream.id}
                                        className="glass-card p-3 flex items-center gap-3 group relative"
                                    >
                                        {/* Platform Icon */}
                                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--surface-elevated))] flex items-center justify-center flex-shrink-0">
                                            {stream.platform === 'twitch' && (
                                                <TwitchIcon className="w-4 h-4 text-[rgb(145_70_255)]" />
                                            )}
                                            {stream.platform === 'youtube' && (
                                                <Youtube className="w-4 h-4 text-[rgb(255_0_0)]" />
                                            )}
                                            {stream.platform === 'kick' && (
                                                <Video className="w-4 h-4 text-[rgb(83_255_75)]" />
                                            )}
                                        </div>

                                        {/* Stream Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                                                {stream.channelName || stream.videoId || stream.title || 'Stream'}
                                            </p>
                                            {stream.viewerCount > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                                                    <Eye className="w-3 h-3" />
                                                    {formatViewerCount(stream.viewerCount)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => {
                                                onRemoveStream(stream.id);
                                                amplitude.track('Stream Removed from Sidebar', {
                                                    platform: stream.platform,
                                                    position: index,
                                                });
                                            }}
                                            className="w-7 h-7 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:border-red-500 transition-all cursor-pointer"
                                            title="Remover stream"
                                        >
                                            <X className="w-4 h-4 text-[hsl(var(--muted-foreground))] hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

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

                {/* Share Button */}
                {streams.length > 0 && (
                    <Button
                        onClick={onShareSetup}
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

            {/* Top Live Streams */}
            {
                streams.length === 0 && (
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
                                                onAddStream(streamer);
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
                )
            }

            <Separator className="bg-[hsl(var(--border))]" />

            {/* Layout Selection */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Layout</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(layoutConfigs) as LayoutType[]).map((layoutType) => {
                        const config = layoutConfigs[layoutType];
                        const Icon = config.icon;
                        const isActive = layout === layoutType;

                        return (
                            <Button
                                key={layoutType}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onLayoutChange(layoutType)}
                                className={`h-20 flex flex-col gap-1.5 transition-all px-3 py-2 ${isActive
                                    ? 'bg-[hsl(217_91%_60%)] text-white border-0 shadow-lg'
                                    : 'bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))]'
                                    }`}
                                title={config.description}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`} />
                                <span className={`text-xs font-medium leading-tight text-center ${isActive ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                    {config.label}
                                </span>
                                <span className={`text-[10px] leading-tight text-center ${isActive ? 'text-white/70' : 'text-[hsl(var(--subtle-foreground))]'}`}>
                                    {config.description}
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            </div>
        </aside >
    );
}
