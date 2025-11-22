import Pusher from 'pusher-js';
import { EventEmitter } from 'events';

export interface KickChatMessage {
    id: string;
    platform: 'kick';
    channelId: string;
    channelName: string;
    username: string;
    displayName: string;
    message: string;
    timestamp: number;
    badges: string[];
    color?: string;
}

interface KickChatMessageEvent {
    id: string;
    chatroom_id: number;
    content: string;
    type: string;
    created_at: string;
    sender: {
        id: number;
        username: string;
        slug: string;
        identity?: {
            color?: string;
            badges?: Array<{ type: string; text: string }>;
        };
    };
}

export class KickChatConnector extends EventEmitter {
    private pusher: Pusher | null = null;
    private channels: Map<string, { chatroomId: number; channel: any }> = new Map();
    private pusherKey = 'eb1d5f283081a78b932c'; // Kick's public Pusher key
    private pusherCluster = 'us2';

    constructor() {
        super();
    }

    async connect(channels: Array<{ channelName: string; chatroomId?: number }>): Promise<void> {
        if (!this.pusher) {
            // Initialize Pusher client
            this.pusher = new Pusher(this.pusherKey, {
                cluster: this.pusherCluster,
                enabledTransports: ['ws', 'wss'],
            });

            this.pusher.connection.bind('connected', () => {
                this.emit('connected', { platform: 'kick' });
                console.log('[Kick] Pusher connected');
            });

            this.pusher.connection.bind('disconnected', () => {
                this.emit('disconnected', { platform: 'kick' });
                console.log('[Kick] Pusher disconnected');
            });
        }

        // Subscribe to each channel's chatroom
        for (const { channelName, chatroomId } of channels) {
            if (this.channels.has(channelName)) {
                continue; // Already subscribed
            }

            // If no chatroomId provided, try to fetch it
            let finalChatroomId = chatroomId;

            if (!finalChatroomId) {
                try {
                    console.log(`[Kick] Fetching chatroom ID for: ${channelName}`);
                    const response = await fetch(`https://kick.com/api/v2/channels/${channelName}`, {
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://kick.com/',
                            'Origin': 'https://kick.com',
                        },
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Kick] Failed to fetch chatroom for ${channelName}:`, errorText);
                        this.emit('error', {
                            platform: 'kick',
                            channelName,
                            error: `Failed to fetch chatroom ID: HTTP ${response.status}`,
                        });
                        continue;
                    }

                    const channelData = await response.json();
                    finalChatroomId = channelData.chatroom?.id;

                    if (!finalChatroomId) {
                        console.error(`[Kick] No chatroom ID for ${channelName}`);
                        this.emit('error', {
                            platform: 'kick',
                            channelName,
                            error: 'No chatroom ID in response',
                        });
                        continue;
                    }
                } catch (error) {
                    console.error(`[Kick] Error fetching chatroom for ${channelName}:`, error);
                    this.emit('error', { platform: 'kick', channelName, error });
                    continue;
                }
            }

            try {
                console.log(`[Kick] Subscribing to chatroom ${finalChatroomId} for ${channelName}`);

                // Subscribe to chatroom channel
                const pusherChannel = this.pusher.subscribe(`chatrooms.${finalChatroomId}.v2`);

                // Log subscription success
                pusherChannel.bind('pusher:subscription_succeeded', () => {
                    console.log(`[Kick] ✅ Successfully subscribed to chatroom ${finalChatroomId} for ${channelName}`);
                });

                pusherChannel.bind('pusher:subscription_error', (error: any) => {
                    console.error(`[Kick] ❌ Subscription error for ${channelName}:`, error);
                    this.emit('error', {
                        platform: 'kick',
                        channelName,
                        error: `Pusher subscription error: ${JSON.stringify(error)}`
                    });
                });

                // Bind to chat message event
                pusherChannel.bind('App\\Events\\ChatMessageSentEvent', (data: KickChatMessageEvent) => {
                    console.log(`[Kick] 💬 Message received from ${channelName}:`, data);
                    this.handleChatMessage(data, channelName);
                });

                // Bind to all events for debugging
                pusherChannel.bind_global((eventName: string, data: any) => {
                    if (!eventName.startsWith('pusher:')) {
                        console.log(`[Kick] 📨 Event "${eventName}" on ${channelName}:`, data);
                    }
                });

                this.channels.set(channelName, { chatroomId: finalChatroomId as number, channel: pusherChannel });
                console.log(`[Kick] ✅ Subscribed to ${channelName} chatroom (ID: ${chatroomId})`);
            } catch (error) {
                console.error(`[Kick] ❌ Error connecting to channel ${channelName}:`, error);
                this.emit('error', { platform: 'kick', channelName, error });
            }
        }
    }

    private handleChatMessage(data: KickChatMessageEvent, channelName: string): void {
        const chatMessage: KickChatMessage = {
            id: data.id || `${Date.now()}-${Math.random()}`,
            platform: 'kick',
            channelId: data.chatroom_id.toString(),
            channelName: channelName,
            username: data.sender.username,
            displayName: data.sender.slug || data.sender.username,
            message: data.content,
            timestamp: new Date(data.created_at).getTime(),
            badges: this.parseBadges(data.sender.identity?.badges),
            color: data.sender.identity?.color || undefined,
        };

        this.emit('message', chatMessage);
    }

    async disconnect(): Promise<void> {
        if (this.pusher) {
            for (const [channelName, { channel }] of this.channels.entries()) {
                channel.unbind_all();
                this.pusher.unsubscribe(channel.name);
            }
            this.pusher.disconnect();
            this.pusher = null;
            this.channels.clear();
        }
    }

    async removeChannel(channelName: string): Promise<void> {
        const channelData = this.channels.get(channelName);
        if (channelData && this.pusher) {
            channelData.channel.unbind_all();
            this.pusher.unsubscribe(channelData.channel.name);
            this.channels.delete(channelName);
        }
    }

    private parseBadges(badges?: Array<{ type: string; text: string }>): string[] {
        if (!badges) return [];
        return badges.map(b => b.type);
    }

    getConnectedChannels(): string[] {
        return Array.from(this.channels.keys());
    }
}
