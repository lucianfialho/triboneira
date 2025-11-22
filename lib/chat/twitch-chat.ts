import { Client } from 'tmi.js';
import { EventEmitter } from 'events';

export interface TwitchChatMessage {
    id: string;
    platform: 'twitch';
    channelId: string;
    channelName: string;
    username: string;
    displayName: string;
    message: string;
    timestamp: number;
    badges: string[];
    color?: string;
    emotes?: Array<{ id: string; code: string; imageUrl: string }>;
}

export class TwitchChatConnector extends EventEmitter {
    private client: Client | null = null;
    private channels: Set<string> = new Set();
    private isConnected = false;

    constructor() {
        super();
    }

    async connect(channels: string[]): Promise<void> {
        if (this.isConnected && this.client) {
            // Add new channels to existing connection
            const newChannels = channels.filter(c => !this.channels.has(c.toLowerCase()));
            if (newChannels.length > 0) {
                for (const channel of newChannels) {
                    await this.client.join(channel);
                    this.channels.add(channel.toLowerCase());
                }
            }
            return;
        }

        // Create new client
        this.client = new Client({
            options: { debug: false },
            connection: {
                reconnect: true,
                secure: true,
            },
            channels: channels,
        });

        // Event handlers
        this.client.on('message', (channel, tags, message, self) => {
            if (self) return; // Ignore own messages

            const chatMessage: TwitchChatMessage = {
                id: tags.id || `${Date.now()}-${Math.random()}`,
                platform: 'twitch',
                channelId: tags['room-id'] || channel.replace('#', ''),
                channelName: channel.replace('#', ''),
                username: tags.username || 'unknown',
                displayName: tags['display-name'] || tags.username || 'Unknown',
                message: message,
                timestamp: Date.now(),
                badges: this.parseBadges(tags.badges),
                color: tags.color || undefined,
                emotes: this.parseEmotes(tags.emotes, message),
            };

            this.emit('message', chatMessage);
        });

        this.client.on('connected', () => {
            this.isConnected = true;
            channels.forEach(c => this.channels.add(c.toLowerCase()));
            this.emit('connected', { platform: 'twitch', channels });
            console.log(`[Twitch] Connected to channels: ${channels.join(', ')}`);
        });

        this.client.on('disconnected', (reason) => {
            this.isConnected = false;
            this.emit('disconnected', { platform: 'twitch', reason });
            console.log(`[Twitch] Disconnected: ${reason}`);
        });

        this.client.on('reconnect', () => {
            this.emit('reconnecting', { platform: 'twitch' });
            console.log('[Twitch] Reconnecting...');
        });

        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.disconnect();
            this.client = null;
            this.isConnected = false;
            this.channels.clear();
        }
    }

    async removeChannel(channel: string): Promise<void> {
        if (this.client && this.channels.has(channel.toLowerCase())) {
            await this.client.part(channel);
            this.channels.delete(channel.toLowerCase());
        }
    }

    private parseBadges(badges: any): string[] {
        if (!badges) return [];
        return Object.keys(badges);
    }

    private parseEmotes(emotes: any, message: string): Array<{ id: string; code: string; imageUrl: string }> | undefined {
        if (!emotes) return undefined;

        const emoteList: Array<{ id: string; code: string; imageUrl: string }> = [];

        for (const [id, positions] of Object.entries(emotes)) {
            const posArray = (positions as string).split(',')[0].split('-');
            const start = parseInt(posArray[0]);
            const end = parseInt(posArray[1]);
            const code = message.substring(start, end + 1);

            emoteList.push({
                id,
                code,
                imageUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`,
            });
        }

        return emoteList.length > 0 ? emoteList : undefined;
    }

    getConnectedChannels(): string[] {
        return Array.from(this.channels);
    }
}
