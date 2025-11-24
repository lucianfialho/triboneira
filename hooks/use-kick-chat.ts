import { useState, useEffect, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';
import { ChatMessage } from './use-chat-websocket';

export interface KickStreamConfig {
    platform: 'kick';
    channelName: string;
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

export function useKickChat(streams: KickStreamConfig[]) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const pusherRef = useRef<Pusher | null>(null);
    const channelsRef = useRef<Map<string, any>>(new Map());

    const PUSHER_KEY = '32cbd69e4b950bf97679'; // Alternative key
    const PUSHER_CLUSTER = 'us2';

    const connect = useCallback(async () => {
        if (streams.length === 0) return;

        setConnectionStatus('connecting');

        try {
            // Initialize Pusher if not already done
            if (!pusherRef.current) {
                pusherRef.current = new Pusher(PUSHER_KEY, {
                    cluster: PUSHER_CLUSTER,
                    forceTLS: true,
                    wsHost: 'ws-us2.pusher.com',
                    wsPort: 80,
                    wssPort: 443,
                    enabledTransports: ['ws', 'wss'],
                });

                pusherRef.current.connection.bind('connected', () => {
                    console.log('[Kick] Pusher connected');
                    setConnectionStatus('connected');
                });

                pusherRef.current.connection.bind('disconnected', () => {
                    console.log('[Kick] Pusher disconnected');
                    setConnectionStatus('disconnected');
                });

                pusherRef.current.connection.bind('error', (err: any) => {
                    console.error('[Kick] Pusher connection error:', err);
                    if (err?.error?.data?.code) {
                        console.error('[Kick] Error code:', err.error.data.code, 'Message:', err.error.data.message);
                    }
                    setConnectionStatus('error');
                });
            }

            // Subscribe to each channel
            console.log('[Kick] Starting connection for streams:', streams);

            for (const stream of streams) {
                if (channelsRef.current.has(stream.channelName)) {
                    console.log(`[Kick] Already subscribed to ${stream.channelName}`);
                    continue;
                }

                try {
                    // Fetch chatroom ID
                    const apiUrl = `https://kick.com/api/v2/channels/${stream.channelName}`;
                    console.log(`[Kick] Fetching chatroom ID for ${stream.channelName} from ${apiUrl}`);

                    const response = await fetch(apiUrl);
                    console.log(`[Kick] API response for ${stream.channelName}: status=${response.status}`);

                    if (!response.ok) {
                        const text = await response.text();
                        console.error(`[Kick] API error for ${stream.channelName}:`, text);
                        throw new Error(`Failed to fetch channel info for ${stream.channelName}: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(`[Kick] API data for ${stream.channelName}:`, data);

                    const chatroomId = data.chatroom?.id;

                    if (!chatroomId) {
                        console.error(`[Kick] No chatroom ID found in data for ${stream.channelName}`);
                        throw new Error(`No chatroom ID found for ${stream.channelName}`);
                    }

                    console.log(`[Kick] Found chatroom ID ${chatroomId} for ${stream.channelName}`);

                    // Subscribe to chatroom
                    const channelName = `chatrooms.${chatroomId}.v2`;
                    console.log(`[Kick] Subscribing to Pusher channel: ${channelName}`);

                    const channel = pusherRef.current.subscribe(channelName);

                    channel.bind('pusher:subscription_succeeded', () => {
                        console.log(`[Kick] ✅ Subscription succeeded for ${stream.channelName} (${channelName})`);
                    });

                    channel.bind('pusher:subscription_error', (err: any) => {
                        console.error(`[Kick] ❌ Subscription error for ${stream.channelName}:`, err);
                    });



                    channel.bind('App\\Events\\ChatMessageEvent', (data: KickChatMessageEvent) => {
                        // console.log(`[Kick] 💬 Message received from ${stream.channelName}:`, data);
                        const chatMessage: ChatMessage = {
                            id: data.id,
                            platform: 'kick',
                            channelId: data.chatroom_id.toString(),
                            channelName: stream.channelName,
                            username: data.sender.username,
                            displayName: data.sender.slug || data.sender.username,
                            message: data.content,
                            timestamp: new Date(data.created_at).getTime(),
                            badges: data.sender.identity?.badges?.map(b => b.type) || [],
                            color: data.sender.identity?.color,
                        };

                        setMessages(prev => {
                            const newMessages = [...prev, chatMessage];
                            if (newMessages.length > 500) return newMessages.slice(-500);
                            return newMessages;
                        });
                    });

                    channelsRef.current.set(stream.channelName, channel);

                } catch (error) {
                    console.error(`[Kick] Error connecting to ${stream.channelName}:`, error);
                }
            }

        } catch (error) {
            console.error('[Kick] Connection error:', error);
            setConnectionStatus('error');
        }
    }, [streams]);

    const disconnect = useCallback(() => {
        if (pusherRef.current) {
            // Unsubscribe from all channels
            channelsRef.current.forEach((channel) => {
                channel.unbind_all();
                pusherRef.current?.unsubscribe(channel.name);
            });
            channelsRef.current.clear();

            pusherRef.current.disconnect();
            pusherRef.current = null;
        }
        setConnectionStatus('disconnected');
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Handle stream changes
    useEffect(() => {
        if (streams.length > 0) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [JSON.stringify(streams)]); // Deep compare streams

    return {
        messages,
        connectionStatus,
        clearMessages
    };
}
