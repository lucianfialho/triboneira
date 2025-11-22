import { useState, useEffect, useCallback, useRef } from 'react';

export interface ChatMessage {
    id: string;
    platform: 'twitch' | 'youtube' | 'kick';
    channelId: string;
    channelName: string;
    username: string;
    displayName: string;
    message: string;
    timestamp: number;
    badges: string[];
    color?: string;
    emotes?: Array<{ id: string; code: string; imageUrl: string }>;
    isSuperChat?: boolean;
    superChatAmount?: string;
}

export interface StreamConfig {
    platform: 'twitch' | 'youtube' | 'kick';
    identifier: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useChatWebSocket(streams: StreamConfig[]) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (streams.length === 0) return;

        setConnectionStatus('connecting');

        try {
            // Create SSE URL with streams parameter
            const streamsParam = encodeURIComponent(JSON.stringify(streams));
            const sseUrl = `/api/chat?streams=${streamsParam}`;

            const eventSource = new EventSource(sseUrl);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('[SSE] Connected to chat server');
                setConnectionStatus('connected');
                reconnectAttempts.current = 0;
            };

            // Handle chat messages
            eventSource.addEventListener('message', (event) => {
                try {
                    const chatMessage = JSON.parse(event.data);
                    setMessages(prev => {
                        const newMessages = [...prev, chatMessage];
                        // Keep max 500 messages in memory
                        if (newMessages.length > 500) {
                            return newMessages.slice(-500);
                        }
                        return newMessages;
                    });
                } catch (error) {
                    console.error('[SSE] Error parsing message:', error);
                }
            });

            // Handle connection events
            eventSource.addEventListener('connected', (event) => {
                const data = JSON.parse(event.data);
                console.log('[SSE] Initialized with streams:', data.streams);
            });

            eventSource.addEventListener('platform_connected', (event) => {
                const data = JSON.parse(event.data);
                console.log('[SSE] Platform connected:', data);
            });

            eventSource.addEventListener('platform_disconnected', (event) => {
                const data = JSON.parse(event.data);
                console.log('[SSE] Platform disconnected:', data);
            });

            eventSource.addEventListener('platform_error', (event) => {
                const data = JSON.parse(event.data);
                console.error('[SSE] Platform error:', data);
            });

            eventSource.addEventListener('heartbeat', () => {
                // Keep-alive heartbeat, no action needed
            });

            eventSource.onerror = (error) => {
                console.error('[SSE] Error:', error);
                setConnectionStatus('error');

                // EventSource will auto-reconnect, but we'll track attempts
                if (eventSource.readyState === EventSource.CLOSED) {
                    eventSourceRef.current = null;

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts.current < maxReconnectAttempts) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectAttempts.current++;
                            connect();
                        }, delay);
                    } else {
                        console.error('[SSE] Max reconnection attempts reached');
                        setConnectionStatus('error');
                    }
                }
            };
        } catch (error) {
            console.error('[SSE] Connection error:', error);
            setConnectionStatus('error');
        }
    }, [streams]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        setConnectionStatus('disconnected');
        reconnectAttempts.current = 0;
    }, []);

    const updateStreams = useCallback((newStreams: StreamConfig[]) => {
        // For SSE, we need to close and reconnect with new streams
        disconnect();
        if (newStreams.length > 0) {
            // Small delay to ensure cleanup
            setTimeout(() => {
                connect();
            }, 100);
        }
    }, [disconnect, connect]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Connect when streams change
    useEffect(() => {
        if (streams.length > 0) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [streams.map(s => `${s.platform}:${s.identifier}`).join(',')]);

    return {
        messages,
        connectionStatus,
        connect,
        disconnect,
        updateStreams,
        clearMessages,
    };
}
