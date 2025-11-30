import { TwitterApi } from 'twitter-api-v2';

/**
 * Twitter API Client
 * Wrapper around twitter-api-v2 for posting tweets and handling mentions
 */

// Lazy initialization to ensure env vars are loaded
let _twitterClient: TwitterApi | null = null;
let _rwClient: any | null = null;
let _roClient: any | null = null;

function getTwitterClient() {
  if (!_twitterClient) {
    _twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }
  return _twitterClient;
}

function getRWClient() {
  if (!_rwClient) {
    _rwClient = getTwitterClient().readWrite;
  }
  return _rwClient;
}

function getROClient() {
  if (!_roClient) {
    _roClient = getTwitterClient().readOnly;
  }
  return _roClient;
}

/**
 * Tweet with optional media
 */
export async function postTweet(params: {
  text: string;
  mediaIds?: string[];
  replyToTweetId?: string;
}): Promise<{ id: string; text: string }> {
  try {
    const tweetPayload: any = {
      text: params.text,
    };

    if (params.mediaIds && params.mediaIds.length > 0) {
      tweetPayload.media = { media_ids: params.mediaIds };
    }

    if (params.replyToTweetId) {
      tweetPayload.reply = { in_reply_to_tweet_id: params.replyToTweetId };
    }

    const tweet = await getRWClient().v2.tweet(tweetPayload);

    return {
      id: tweet.data.id,
      text: tweet.data.text,
    };
  } catch (error: any) {
    console.error('❌ Failed to post tweet:', error);
    throw new Error(`Twitter API error: ${error.message}`);
  }
}

/**
 * Upload media (image) to Twitter
 * Returns media_id to be used in tweet
 */
export async function uploadMedia(filePath: string): Promise<string> {
  try {
    const mediaId = await getRWClient().v1.uploadMedia(filePath);
    return mediaId;
  } catch (error: any) {
    console.error('❌ Failed to upload media:', error);
    throw new Error(`Media upload error: ${error.message}`);
  }
}

/**
 * Get mentions (tweets mentioning the bot)
 */
export async function getMentions(params?: {
  sinceId?: string;
  maxResults?: number;
}): Promise<Array<{
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  createdAt: Date;
}>> {
  try {
    const mentions = await getROClient().v2.me();
    const userId = mentions.data.id;

    const timeline = await getROClient().v2.userMentionTimeline(userId, {
      since_id: params?.sinceId,
      max_results: params?.maxResults || 10,
      'tweet.fields': ['created_at', 'author_id'],
      expansions: ['author_id'],
    });

    const results: Array<{
      id: string;
      text: string;
      authorId: string;
      authorUsername: string;
      createdAt: Date;
    }> = [];

    for (const tweet of timeline.data.data || []) {
      const author = timeline.includes?.users?.find((u: any) => u.id === tweet.author_id);

      results.push({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id!,
        authorUsername: author?.username || 'unknown',
        createdAt: new Date(tweet.created_at!),
      });
    }

    return results;
  } catch (error: any) {
    console.error('❌ Failed to fetch mentions:', error);
    throw new Error(`Mentions fetch error: ${error.message}`);
  }
}

/**
 * Get tweet analytics/metrics
 */
export async function getTweetMetrics(tweetId: string): Promise<{
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
}> {
  try {
    const tweet = await getROClient().v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics'],
    });

    const metrics = tweet.data.public_metrics!;

    return {
      impressions: metrics.impression_count || 0,
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      replies: metrics.reply_count || 0,
    };
  } catch (error: any) {
    console.error(`❌ Failed to fetch metrics for tweet ${tweetId}:`, error);
    throw new Error(`Metrics fetch error: ${error.message}`);
  }
}

/**
 * Create a thread (series of tweets)
 */
export async function postThread(tweets: string[]): Promise<Array<{ id: string; text: string }>> {
  const results: Array<{ id: string; text: string }> = [];

  let previousTweetId: string | undefined;

  for (const text of tweets) {
    const tweet = await postTweet({
      text,
      replyToTweetId: previousTweetId,
    });

    results.push(tweet);
    previousTweetId = tweet.id;

    // Small delay between tweets to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Check rate limit status
 * Note: Twitter API v2 Free tier doesn't provide direct rate limit info
 * This is a placeholder that returns basic info
 */
export async function getRateLimitStatus(): Promise<{
  tweetsRemaining: number;
  tweetsResetAt: Date;
}> {
  try {
    // Twitter API v2 Free tier doesn't expose rate limits via API
    // We track this manually in the database
    // This is a placeholder for future Pro tier upgrade
    return {
      tweetsRemaining: 50, // Free tier limit
      tweetsResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };
  } catch (error: any) {
    console.error('❌ Failed to check rate limits:', error);
    return {
      tweetsRemaining: 0,
      tweetsResetAt: new Date(),
    };
  }
}

// Export helper functions for advanced usage if needed
export { getRWClient, getROClient, getTwitterClient };
