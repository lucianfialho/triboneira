import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        const newsList = await db
            .select({
                id: news.id,
                externalId: news.externalId,
                slug: news.slug,
                slugPtBr: news.slugPtBr,
                imageUrl: news.imageUrl,
                publishedAt: news.publishedAt,
                link: news.link,
                originalTitle: news.title,
                translatedTitle: newsTranslations.title,
                summaryBullets: newsSummaries.bullets,
            })
            .from(news)
            .leftJoin(newsTranslations, eq(newsTranslations.newsId, news.id))
            .leftJoin(newsSummaries, eq(newsSummaries.newsId, news.id))
            // .where(eq(news.gameId, 1)) // CS2 - Optional filter if we have multiple games
            .orderBy(desc(news.publishedAt))
            .limit(limit)
            .offset(offset);

        // Formatar resposta
        const formattedNews = newsList.map(item => {
            return {
                id: item.id,
                externalId: item.externalId,
                title: item.translatedTitle || item.originalTitle,
                slug: item.slugPtBr || item.slug,
                imageUrl: item.imageUrl,
                publishedAt: item.publishedAt,
                link: item.link,
                isTranslated: !!item.translatedTitle,
                summaryBullets: item.summaryBullets,
            };
        });

        return Response.json({
            news: formattedNews,
            hasMore: newsList.length === limit,
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
