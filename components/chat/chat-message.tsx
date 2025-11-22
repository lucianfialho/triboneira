'use client';

import React from 'react';
import { Twitch as TwitchIcon, Youtube, Video, Shield, Star, Verified, Crown } from 'lucide-react';
import { ChatMessage } from '@/hooks/use-chat-websocket';

interface ChatMessageComponentProps {
    message: ChatMessage;
    compact?: boolean;
}

const platformColors = {
    twitch: 'from-purple-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    kick: 'from-green-500 to-green-600',
};

const platformIcons = {
    twitch: TwitchIcon,
    youtube: Youtube,
    kick: Video,
};

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    moderator: Shield,
    owner: Crown,
    verified: Verified,
    member: Star,
    subscriber: Star,
};

export function ChatMessageComponent({ message, compact = false }: ChatMessageComponentProps) {
    const PlatformIcon = platformIcons[message.platform];

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = () => {
        if (!message.emotes || message.emotes.length === 0) {
            return <span className="break-words">{message.message}</span>;
        }

        // Create a map of emote codes to URLs
        const emoteMap = new Map(message.emotes.map(e => [e.code, e.imageUrl]));

        // Split message by words and render emotes as images
        const parts = message.message.split(/(\s+)/);

        return (
            <span className="break-words inline-flex flex-wrap items-center gap-1">
                {parts.map((part, index) => {
                    const emoteUrl = emoteMap.get(part);
                    if (emoteUrl) {
                        return (
                            <img
                                key={index}
                                src={emoteUrl}
                                alt={part}
                                className="inline-block h-5 w-auto"
                                title={part}
                            />
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </span>
        );
    };

    return (
        <div
            className={`group hover:bg-[hsl(var(--muted))]/30 transition-colors ${compact ? 'px-2 py-1' : 'px-3 py-2'
                } ${message.isSuperChat ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : ''}`}
        >
            <div className="flex items-start gap-2">
                {/* Platform Badge */}
                {!compact && (
                    <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${platformColors[message.platform]} flex items-center justify-center`}>
                        <PlatformIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        {/* Badges */}
                        {message.badges.length > 0 && (
                            <div className="flex items-center gap-0.5">
                                {message.badges.slice(0, 3).map((badge, index) => {
                                    const BadgeIcon = badgeIcons[badge];
                                    if (!BadgeIcon) return null;

                                    return (
                                        <BadgeIcon
                                            key={index}
                                            className={`w-3 h-3 ${badge === 'moderator' ? 'text-green-500' :
                                                badge === 'owner' ? 'text-yellow-500' :
                                                    badge === 'verified' ? 'text-blue-500' :
                                                        'text-purple-500'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Username */}
                        <span
                            className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} truncate`}
                            style={{ color: message.color || 'inherit' }}
                        >
                            {message.displayName}
                        </span>

                        {/* Platform indicator (compact mode) */}
                        {compact && (
                            <span className={`text-[10px] opacity-50 capitalize`}>
                                {message.platform}
                            </span>
                        )}

                        {/* Timestamp */}
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatTime(message.timestamp)}
                        </span>

                        {/* Super Chat indicator */}
                        {message.isSuperChat && message.superChatAmount && (
                            <span className="text-xs font-bold text-yellow-500">
                                {message.superChatAmount}
                            </span>
                        )}
                    </div>

                    {/* Message Content */}
                    <div className={`text-[hsl(var(--foreground))] ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
                        {renderMessage()}
                    </div>
                </div>
            </div>
        </div>
    );
}
