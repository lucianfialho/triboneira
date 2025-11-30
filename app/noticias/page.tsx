import { Metadata } from 'next';
import { NewsCard } from '@/components/news/news-card';
import { Newspaper } from 'lucide-react';
import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Notícias CS2 - Últimas Notícias do Counter-Strike 2 | Triboneira',
  description: 'Fique por dentro das últimas notícias do Counter-Strike 2. Atualizações de times, torneios, transfers e tudo sobre o cenário competitivo de CS2.',
  keywords: 'CS2 notícias, Counter-Strike 2, esports, CS:GO, torneios, times, transfers',
  openGraph: {
    title: 'Notícias CS2 - Counter-Strike 2 | Triboneira',
    description: 'Últimas notícias do cenário competitivo de Counter-Strike 2',
    type: 'website',
  },
};

export const revalidate = 600; // Revalidate every 10 minutes

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string;
  link: string;
  isTranslated: boolean;
  summaryBullets?: Array<{ type: string; text: string }>;
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const newsList = await db
      .select({
        id: news.id,
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
      .orderBy(desc(news.publishedAt))
      .limit(30);

    return newsList.map((item) => ({
      id: item.id,
      title: item.translatedTitle || item.originalTitle,
      slug: item.slugPtBr || item.slug || '',
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt?.toISOString() || '',
      link: item.link,
      isTranslated: !!item.translatedTitle,
      summaryBullets: item.summaryBullets as Array<{ type: string; text: string }> | undefined,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-8 h-8 text-[hsl(var(--primary))]" />
            <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
              Notícias CS2
            </h1>
          </div>
          <p className="text-[hsl(var(--muted-foreground))] max-w-2xl">
            Últimas notícias do cenário competitivo de Counter-Strike 2
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {news.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-50" />
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
              Nenhuma notícia encontrada
            </h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Aguarde enquanto atualizamos nosso conteúdo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
