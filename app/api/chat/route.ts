import { NextRequest } from 'next/server';
import { ChatAggregator, StreamConfig, UnifiedChatMessage } from '@/lib/chat/chat-aggregator';

// Store active aggregators per connection
const activeConnections = new Map<string, ChatAggregator>();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const streamsParam = searchParams.get('streams');

    if (!streamsParam) {
        return new Response('Missing streams parameter', { status: 400 });
    }

    try {
        // Parse streams from query parameter
        const streams: StreamConfig[] = JSON.parse(decodeURIComponent(streamsParam));

        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        const aggregator = new ChatAggregator(youtubeApiKey);

        // Generate unique connection ID
        const connectionId = `${Date.now()}-${Math.random()}`;
        activeConnections.set(connectionId, aggregator);

        // Create Server-Sent Events stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let isClosed = false;

                // Helper to send SSE message
                const sendEvent = (event: string, data: any) => {
                    if (isClosed) return; // Don't send if closed

                    try {
                        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                        controller.enqueue(encoder.encode(message));
                    } catch (error) {
                        console.error('[SSE] Error sending event:', error);
                        isClosed = true;
                    }
                };

                // Set up event handlers
                aggregator.on('message', (chatMessage: UnifiedChatMessage) => {
                    sendEvent('message', chatMessage);
                });

                aggregator.on('platform_connected', (platformData) => {
                    sendEvent('platform_connected', platformData);
                });

                aggregator.on('platform_disconnected', (platformData) => {
                    sendEvent('platform_disconnected', platformData);
                });

                aggregator.on('platform_error', (errorData) => {
                    sendEvent('platform_error', errorData);
                });

                // Connect to all streams
                try {
                    await aggregator.connect(streams);
                    sendEvent('connected', { streams, connectionId });
                } catch (error) {
                    sendEvent('error', { message: 'Failed to connect to streams' });
                    controller.close();
                    return;
                }

                // Keep connection alive with heartbeat
                const heartbeat = setInterval(() => {
                    sendEvent('heartbeat', { timestamp: Date.now() });
                }, 30000); // Every 30 seconds

                // Cleanup on close
                req.signal.addEventListener('abort', async () => {
                    isClosed = true;
                    clearInterval(heartbeat);
                    await aggregator.disconnect();
                    activeConnections.delete(connectionId);
                    controller.close();
                });
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // Disable buffering in nginx
            },
        });
    } catch (error) {
        console.error('[SSE] Error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
