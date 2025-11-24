'use client';

import React from 'react';
import { Twitch as TwitchIcon, Youtube, Video, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ChatFiltersProps {
    platformFilters: Set<'twitch' | 'youtube' | 'kick'>;
    channelFilters: Set<string>;
    searchKeyword: string;
    availableChannels: Array<{ platform: string; channelName: string }>;
    onPlatformToggle: (platform: 'twitch' | 'youtube' | 'kick') => void;
    onChannelToggle: (channelKey: string) => void;
    onSearchChange: (keyword: string) => void;
    onClearFilters: () => void;
}

const platformIcons = {
    twitch: TwitchIcon,
    youtube: Youtube,
    kick: Video,
};

const platformColors = {
    twitch: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    youtube: 'text-red-400 bg-red-500/20 border-red-500/30',
    kick: 'text-green-400 bg-green-500/20 border-green-500/30',
};

export function ChatFilters({
    platformFilters,
    channelFilters,
    searchKeyword,
    availableChannels,
    onPlatformToggle,
    onChannelToggle,
    onSearchChange,
    onClearFilters,
}: ChatFiltersProps) {
    const hasActiveFilters =
        platformFilters.size < 3 ||
        channelFilters.size > 0 ||
        searchKeyword.length > 0;

    return (
        <div className="flex flex-col gap-2 p-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchKeyword}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-9 text-sm"
                />
                {searchKeyword && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Platform Filters */}
                <div className="flex items-center gap-1">
                    {(['twitch', 'youtube', 'kick'] as const).map((platform) => {
                        const Icon = platformIcons[platform];
                        const isActive = platformFilters.has(platform);
                        const isKick = platform === 'kick';

                        return (
                            <button
                                key={platform}
                                onClick={() => onPlatformToggle(platform)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all border ${isActive
                                    ? platformColors[platform]
                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-transparent opacity-40 hover:opacity-70'
                                    }`}
                                title={`${isActive ? 'Hide' : 'Show'} ${platform} messages`}
                            >
                                <Icon className="w-3 h-3" />
                                <span className="capitalize hidden sm:inline">{platform}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Channel Filter Dropdown */}
                {availableChannels.length > 1 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                                Channels
                                {channelFilters.size > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold">
                                        {channelFilters.size}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Filter by Channel</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableChannels.map((channel) => {
                                const channelKey = `${channel.platform}:${channel.channelName}`;
                                const Icon = platformIcons[channel.platform as keyof typeof platformIcons];

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={channelKey}
                                        checked={channelFilters.has(channelKey)}
                                        onCheckedChange={() => onChannelToggle(channelKey)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-3 h-3" />
                                            <span className="truncate">{channel.channelName}</span>
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-7 text-xs ml-auto"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
