'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageCircle, X, Wifi, WifiOff, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatWebSocket, ChatMessage, StreamConfig } from '@/hooks/use-chat-websocket';
import { ChatMessageComponent } from './chat-message';
import { ChatFilters } from './chat-filters';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ChatPanelProps {
    streams: Array<{
        platform: 'twitch' | 'youtube' | 'kick';
        channelName?: string;
        videoId?: string;
    }>;
    isVisible: boolean;
    onToggle: () => void;
    compact?: boolean;
}

export function ChatPanel({ streams, isVisible, onToggle, compact = false }: ChatPanelProps) {
    const [platformFilters, setPlatformFilters] = useState<Set<'twitch' | 'youtube' | 'kick'>>(
        new Set(['twitch', 'youtube', 'kick'])
    );
    const [channelFilters, setChannelFilters] = useState<Set<string>>(new Set());
    const [searchKeyword, setSearchKeyword] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(0);

    // Convert streams to StreamConfig format
    const streamConfigs: StreamConfig[] = useMemo(() => {
        return streams.map(stream => ({
            platform: stream.platform,
            identifier: stream.platform === 'youtube'
                ? (stream.videoId || '')
                : (stream.channelName || ''),
        })).filter(s => s.identifier); // Filter out invalid streams
    }, [streams]);

    // Use WebSocket hook
    const { messages, connectionStatus } = useChatWebSocket(streamConfigs);

    // Filter messages
    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            // Platform filter
            if (!platformFilters.has(msg.platform)) return false;

            // Channel filter
            if (channelFilters.size > 0) {
                const channelKey = `${msg.platform}:${msg.channelName}`;
                if (!channelFilters.has(channelKey)) return false;
            }

            // Search filter
            if (searchKeyword) {
                const keyword = searchKeyword.toLowerCase();
                return (
                    msg.message.toLowerCase().includes(keyword) ||
                    msg.displayName.toLowerCase().includes(keyword) ||
                    msg.username.toLowerCase().includes(keyword)
                );
            }

            return true;
        });
    }, [messages, platformFilters, channelFilters, searchKeyword]);

    // Virtual scrolling
    const rowVirtualizer = useVirtualizer({
        count: filteredMessages.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => (compact ? 50 : 70),
        overscan: 10,
    });

    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && filteredMessages.length > prevMessagesLengthRef.current) {
            scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
        prevMessagesLengthRef.current = filteredMessages.length;
    }, [filteredMessages.length, autoScroll]);

    // Detect manual scroll
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

        setAutoScroll(isAtBottom);
    };

    // Available channels for filter
    const availableChannels = useMemo(() => {
        const channelsMap = new Map<string, { platform: string; channelName: string }>();

        messages.forEach(msg => {
            const key = `${msg.platform}:${msg.channelName}`;
            if (!channelsMap.has(key)) {
                channelsMap.set(key, {
                    platform: msg.platform,
                    channelName: msg.channelName,
                });
            }
        });

        return Array.from(channelsMap.values());
    }, [messages]);

    // Filter handlers
    const handlePlatformToggle = (platform: 'twitch' | 'youtube' | 'kick') => {
        setPlatformFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platform)) {
                newSet.delete(platform);
            } else {
                newSet.add(platform);
            }
            return newSet;
        });
    };

    const handleChannelToggle = (channelKey: string) => {
        setChannelFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(channelKey)) {
                newSet.delete(channelKey);
            } else {
                newSet.add(channelKey);
            }
            return newSet;
        });
    };

    const handleClearFilters = () => {
        setPlatformFilters(new Set(['twitch', 'youtube', 'kick']));
        setChannelFilters(new Set());
        setSearchKeyword('');
    };

    if (streams.length === 0) return null;

    return (
        <>
            {/* Chat Panel - Fixed Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full bg-[hsl(var(--background))] border-l border-[hsl(var(--border))] shadow-2xl transition-transform duration-300 ease-in-out z-30 flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    } ${compact ? 'w-80' : 'w-96'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">Live Chat</span>

                        {/* Connection Status */}
                        {connectionStatus === 'connected' && (
                            <Wifi className="w-4 h-4 text-green-500" />
                        )}
                        {connectionStatus === 'connecting' && (
                            <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        )}
                        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                            <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Filters */}
                <ChatFilters
                    platformFilters={platformFilters}
                    channelFilters={channelFilters}
                    searchKeyword={searchKeyword}
                    availableChannels={availableChannels}
                    onPlatformToggle={handlePlatformToggle}
                    onChannelToggle={handleChannelToggle}
                    onSearchChange={setSearchKeyword}
                    onClearFilters={handleClearFilters}
                />

                {/* Messages */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto"
                    style={{ overflowAnchor: 'none' }}
                >
                    {filteredMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center p-6">
                            <div>
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))] opacity-50" />
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    {connectionStatus === 'connected'
                                        ? 'No messages yet. Chat will appear here.'
                                        : 'Connecting to chat...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const message = filteredMessages[virtualRow.index];
                                return (
                                    <div
                                        key={message.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <ChatMessageComponent message={message} compact={compact} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Scroll to Bottom Button */}
                {!autoScroll && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button
                            size="sm"
                            onClick={() => {
                                scrollContainerRef.current?.scrollTo({
                                    top: scrollContainerRef.current.scrollHeight,
                                    behavior: 'smooth',
                                });
                                setAutoScroll(true);
                            }}
                            className="shadow-lg"
                        >
                            <ChevronRight className="w-4 h-4 rotate-90" />
                            New messages
                        </Button>
                    </div>
                )}

                {/* Message Count */}
                <div className="px-3 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 text-xs text-[hsl(var(--muted-foreground))]">
                    {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
                    {messages.length !== filteredMessages.length && ` (${messages.length} total)`}
                </div>
            </div>
        </>
    );
}
