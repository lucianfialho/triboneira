import { EventEmitter } from 'events';
import { TwitchChatConnector, TwitchChatMessage } from './twitch-chat';
import { YouTubeChatConnector, YouTubeChatMessage } from './youtube-chat';
import { KickChatConnector, KickChatMessage } from './kick-chat';

export type UnifiedChatMessage = TwitchChatMessage | YouTubeChatMessage | KickChatMessage;

export interface StreamConfig {
    platform: 'twitch' | 'youtube' | 'kick';
    identifier: string; // channelName for Twitch/Kick, videoId for YouTube
}

export class ChatAggregator extends EventEmitter {
    private twitchConnector: TwitchChatConnector;
    private youtubeConnector: YouTubeChatConnector | null = null;
    private kickConnector: KickChatConnector;
    private messageQueue: UnifiedChatMessage[] = [];
    private messageThrottle: NodeJS.Timeout | null = null;
    private maxMessagesPerSecond = 50;
    private maxQueueSize = 500;

    constructor(youtubeApiKey?: string) {
        super();

        this.twitchConnector = new TwitchChatConnector();
        if (youtubeApiKey) {
            this.youtubeConnector = new YouTubeChatConnector(youtubeApiKey);
        }
        this.kickConnector = new KickChatConnector();

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Twitch events
        this.twitchConnector.on('message', (message: TwitchChatMessage) => {
            this.queueMessage(message);
        });

        this.twitchConnector.on('connected', (data) => {
            this.emit('platform_connected', data);
        });

        this.twitchConnector.on('disconnected', (data) => {
            this.emit('platform_disconnected', data);
        });

        // YouTube events
        if (this.youtubeConnector) {
            this.youtubeConnector.on('message', (message: YouTubeChatMessage) => {
                this.queueMessage(message);
            });

            this.youtubeConnector.on('connected', (data) => {
                this.emit('platform_connected', data);
            });

            this.youtubeConnector.on('error', (data) => {
                this.emit('platform_error', data);
            });
        }

        // Kick events
        this.kickConnector.on('message', (message: KickChatMessage) => {
            this.queueMessage(message);
        });

        this.kickConnector.on('connected', (data) => {
            this.emit('platform_connected', data);
        });

        this.kickConnector.on('disconnected', (data) => {
            this.emit('platform_disconnected', data);
        });
    }

    private queueMessage(message: UnifiedChatMessage): void {
        // Add to queue
        this.messageQueue.push(message);

        // Keep queue size manageable
        if (this.messageQueue.length > this.maxQueueSize) {
            this.messageQueue.shift(); // Remove oldest
        }

        // Start throttle if not already running
        if (!this.messageThrottle) {
            this.messageThrottle = setInterval(() => {
                this.flushMessages();
            }, 1000 / this.maxMessagesPerSecond);
        }
    }

    private flushMessages(): void {
        if (this.messageQueue.length === 0) {
            if (this.messageThrottle) {
                clearInterval(this.messageThrottle);
                this.messageThrottle = null;
            }
            return;
        }

        // Send next message
        const message = this.messageQueue.shift();
        if (message) {
            this.emit('message', message);
        }
    }

    async connect(streams: StreamConfig[]): Promise<void> {
        // Group streams by platform
        const twitchChannels = streams
            .filter(s => s.platform === 'twitch')
            .map(s => s.identifier);

        const youtubeVideoIds = streams
            .filter(s => s.platform === 'youtube')
            .map(s => s.identifier);

        const kickChannels = streams
            .filter(s => s.platform === 'kick')
            .map(s => ({ channelName: s.identifier }));

        // Connect to each platform
        const promises: Promise<void>[] = [];

        if (twitchChannels.length > 0) {
            promises.push(this.twitchConnector.connect(twitchChannels));
        }

        if (youtubeVideoIds.length > 0 && this.youtubeConnector) {
            promises.push(this.youtubeConnector.connect(youtubeVideoIds));
        }

        if (kickChannels.length > 0) {
            if (kickChannels.length > 0) {
                // Kick chat is handled client-side to bypass Cloudflare protection
                console.log('[Kick] Chat handled client-side for channels:', kickChannels.map(c => c.channelName));
            }
        }

        await Promise.allSettled(promises);
    }

    async disconnect(): Promise<void> {
        await Promise.allSettled([
            this.twitchConnector.disconnect(),
            this.youtubeConnector?.disconnect(),
            this.kickConnector.disconnect(),
        ]);

        if (this.messageThrottle) {
            clearInterval(this.messageThrottle);
            this.messageThrottle = null;
        }

        this.messageQueue = [];
        this.removeAllListeners();
    }

    async updateStreams(streams: StreamConfig[]): Promise<void> {
        // Get currently connected channels
        const currentTwitch = new Set(this.twitchConnector.getConnectedChannels());
        const currentYouTube = new Set(this.youtubeConnector?.getConnectedChannels() || []);
        const currentKick = new Set(this.kickConnector.getConnectedChannels());

        // Get new channels
        const newTwitch = new Set(streams.filter(s => s.platform === 'twitch').map(s => s.identifier));
        const newYouTube = new Set(streams.filter(s => s.platform === 'youtube').map(s => s.identifier));
        const newKick = new Set(streams.filter(s => s.platform === 'kick').map(s => s.identifier));

        // Remove channels no longer needed
        for (const channel of currentTwitch) {
            if (!newTwitch.has(channel)) {
                await this.twitchConnector.removeChannel(channel);
            }
        }

        for (const videoId of currentYouTube) {
            if (!newYouTube.has(videoId)) {
                await this.youtubeConnector?.removeChannel(videoId);
            }
        }

        for (const channel of currentKick) {
            if (!newKick.has(channel)) {
                await this.kickConnector.removeChannel(channel);
            }
        }

        // Add new channels
        const channelsToAdd = streams.filter(s => {
            if (s.platform === 'twitch') return !currentTwitch.has(s.identifier);
            if (s.platform === 'youtube') return !currentYouTube.has(s.identifier);
            if (s.platform === 'kick') return !currentKick.has(s.identifier);
            return false;
        });

        if (channelsToAdd.length > 0) {
            await this.connect(channelsToAdd);
        }
    }
}
