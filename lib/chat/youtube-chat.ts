import { google, youtube_v3 } from 'googleapis';
import { EventEmitter } from 'events';

export interface YouTubeChatMessage {
    id: string;
    platform: 'youtube';
    channelId: string;
    channelName: string;
    username: string;
    displayName: string;
    message: string;
    timestamp: number;
    badges: string[];
    color?: string;
    isSuperChat?: boolean;
    superChatAmount?: string;
}

export class YouTubeChatConnector extends EventEmitter {
    private youtube: youtube_v3.Youtube;
    private activeLiveChats: Map<string, { liveChatId: string; pollingInterval?: NodeJS.Timeout; pageToken?: string }> = new Map();
    private apiKey: string;

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
        this.youtube = google.youtube({
            version: 'v3',
            auth: apiKey,
        });
    }

    async connect(videoIds: string[]): Promise<void> {
        for (const videoId of videoIds) {
            if (this.activeLiveChats.has(videoId)) {
                continue; // Already connected
            }

            try {
                // Get live chat ID from video
                const videoResponse = await this.youtube.videos.list({
                    part: ['liveStreamingDetails', 'snippet'],
                    id: [videoId],
                });

                const video = videoResponse.data.items?.[0];
                if (!video) {
                    console.error(`[YouTube] Video not found: ${videoId}`);
                    continue;
                }

                const liveChatId = video.liveStreamingDetails?.activeLiveChatId;
                if (!liveChatId) {
                    console.error(`[YouTube] No active live chat for video: ${videoId}`);
                    continue;
                }

                const channelName = video.snippet?.channelTitle || 'Unknown Channel';

                // Start polling for messages
                this.activeLiveChats.set(videoId, { liveChatId });
                this.pollMessages(videoId, liveChatId, channelName);

                this.emit('connected', { platform: 'youtube', videoId, liveChatId });
                console.log(`[YouTube] Connected to live chat: ${channelName} (${videoId})`);
            } catch (error) {
                console.error(`[YouTube] Error connecting to video ${videoId}:`, error);
                this.emit('error', { platform: 'youtube', videoId, error });
            }
        }
    }

    private async pollMessages(videoId: string, liveChatId: string, channelName: string): Promise<void> {
        const chatData = this.activeLiveChats.get(videoId);
        if (!chatData) return;

        try {
            const response = await this.youtube.liveChatMessages.list({
                liveChatId,
                part: ['snippet', 'authorDetails'],
                pageToken: chatData.pageToken,
                maxResults: 200,
            });

            const messages = response.data.items || [];
            const nextPageToken = response.data.nextPageToken;
            const pollingIntervalMillis = response.data.pollingIntervalMillis || 5000;

            // Process messages
            for (const item of messages) {
                const snippet = item.snippet;
                const authorDetails = item.authorDetails;

                if (!snippet || !authorDetails) continue;

                const chatMessage: YouTubeChatMessage = {
                    id: item.id || `${Date.now()}-${Math.random()}`,
                    platform: 'youtube',
                    channelId: videoId,
                    channelName: channelName,
                    username: (authorDetails.channelId || 'unknown') as string,
                    displayName: authorDetails.displayName || 'Unknown',
                    message: snippet.displayMessage || '',
                    timestamp: snippet.publishedAt ? new Date(snippet.publishedAt).getTime() : Date.now(),
                    badges: this.parseBadges(authorDetails),
                    isSuperChat: snippet.type === 'superChatEvent',
                    superChatAmount: (snippet as any).superChatDetails?.amountDisplayString,
                };

                this.emit('message', chatMessage);
            }

            // Update page token and schedule next poll
            chatData.pageToken = nextPageToken || undefined;

            if (this.activeLiveChats.has(videoId)) {
                chatData.pollingInterval = setTimeout(() => {
                    this.pollMessages(videoId, liveChatId, channelName);
                }, pollingIntervalMillis);
            }
        } catch (error: any) {
            console.error(`[YouTube] Error polling messages for ${videoId}:`, error.message);

            // Retry after 10 seconds on error
            if (this.activeLiveChats.has(videoId)) {
                const chatData = this.activeLiveChats.get(videoId);
                if (chatData) {
                    chatData.pollingInterval = setTimeout(() => {
                        this.pollMessages(videoId, liveChatId, channelName);
                    }, 10000);
                }
            }
        }
    }

    async disconnect(): Promise<void> {
        for (const [videoId, chatData] of this.activeLiveChats.entries()) {
            if (chatData.pollingInterval) {
                clearTimeout(chatData.pollingInterval);
            }
        }
        this.activeLiveChats.clear();
    }

    async removeChannel(videoId: string): Promise<void> {
        const chatData = this.activeLiveChats.get(videoId);
        if (chatData) {
            if (chatData.pollingInterval) {
                clearTimeout(chatData.pollingInterval);
            }
            this.activeLiveChats.delete(videoId);
        }
    }

    private parseBadges(authorDetails: youtube_v3.Schema$LiveChatMessageAuthorDetails): string[] {
        const badges: string[] = [];

        if (authorDetails.isChatOwner) badges.push('owner');
        if (authorDetails.isChatModerator) badges.push('moderator');
        if (authorDetails.isChatSponsor) badges.push('member');
        if (authorDetails.isVerified) badges.push('verified');

        return badges;
    }

    getConnectedChannels(): string[] {
        return Array.from(this.activeLiveChats.keys());
    }
}
