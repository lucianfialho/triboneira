import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { NewsCard } from '@/components/news/news-card';
import { Newspaper, Calendar } from 'lucide-react';
import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Bullet } from '@/types/news';

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
  externalId: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  link: string;
  isTranslated: boolean;
  summaryBullets?: Bullet[];
}

async function getNews(): Promise<NewsItem[]> {
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
      .orderBy(desc(news.publishedAt))
      .limit(30);

    return newsList.map((item) => ({
      id: item.id,
      externalId: item.externalId,
      title: item.translatedTitle || item.originalTitle,
      slug: item.slugPtBr || item.slug || '',
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt || null,
      link: item.link,
      isTranslated: !!item.translatedTitle,
      summaryBullets: item.summaryBullets as Bullet[] | undefined,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NoticiasPage() {
  const news = await getNews();
  const featuredNews = news.slice(0, 1)[0];
  const topNews = news.slice(1, 4);
  const otherNews = news.slice(4);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                  Notícias CS2
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Cobertura completa do cenário competitivo
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Atualizado automaticamente</span>
            </div>
          </div>
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
          <div className="space-y-8">
            {/* Featured News - Destaque Principal */}
            {featuredNews && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                    Destaque
                  </span>
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                </div>
                <Link href={`/noticias/${featuredNews.slug}`} className="block group">
                  <div className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className={`grid ${featuredNews.imageUrl ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-0`}>
                      {/* Image */}
                      {featuredNews.imageUrl && (
                        <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden bg-[hsl(var(--surface))]">
                          <Image
                            src={featuredNews.imageUrl}
                            alt={featuredNews.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            priority
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        {featuredNews.isTranslated && (
                          <span className="inline-flex items-center w-fit px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 mb-3">
                            Traduzido PT-BR
                          </span>
                        )}

                        <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-3 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-3">
                          {featuredNews.title}
                        </h2>

                        {/* Summary bullets */}
                        {featuredNews.summaryBullets && featuredNews.summaryBullets.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {featuredNews.summaryBullets.slice(0, 3).map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                                <span className="line-clamp-2">{bullet.text}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-auto">
                          <Calendar className="w-3 h-3" />
                          <time>{featuredNews.publishedAt ? new Date(featuredNews.publishedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Data não disponível'}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Top 3 News Grid */}
            {topNews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground))]">
                    Principais Notícias
                  </span>
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {topNews.map((item) => (
                    <Link key={item.id} href={`/noticias/${item.slug}`} className="block group">
                      <div className="glass-card overflow-hidden h-full hover:shadow-lg transition-all duration-300">
                        {item.imageUrl && (
                          <div className="relative aspect-video overflow-hidden bg-[hsl(var(--surface))]">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          {item.isTranslated && (
                            <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20 mb-2">
                              PT-BR
                            </span>
                          )}
                          <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-3">
                            {item.title}
                          </h3>
                          <time className="text-xs text-[hsl(var(--muted-foreground))]">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Data não disponível'}
                          </time>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Other News - List */}
            {otherNews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground))]">
                    Mais Notícias
                  </span>
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherNews.map((item) => (
                    <NewsCard key={item.id} news={item} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
