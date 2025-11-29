import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/types/news';
import { Calendar, ExternalLink } from 'lucide-react';

interface NewsCardProps {
    news: NewsItem;
    compact?: boolean;
}

export function NewsCard({ news, compact = false }: NewsCardProps) {
    const formattedDate = news.publishedAt
        ? new Date(news.publishedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        : '';

    return (
        <Link
            href={`/news/${news.id}`}
            className="group block bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className={`flex ${compact ? 'gap-3' : 'gap-4'} p-3`}>
                {/* Image */}
                {news.imageUrl && (
                    <div className={`relative shrink-0 ${compact ? 'w-24 h-16' : 'w-32 h-20'} rounded-lg overflow-hidden bg-[hsl(var(--surface))]`}>
                        <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100px, 150px"
                        />
                    </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-semibold text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
                                {news.title}
                            </h3>
                        </div>

                        {/* Summary Bullets Preview - Only show 1 if not compact */}
                        {!compact && news.summaryBullets && news.summaryBullets.length > 0 && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 mb-2">
                                • {news.summaryBullets[0].text}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                        {news.isTranslated && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                PT-BR
                            </span>
                        )}

                        {formattedDate && (
                            <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                                <Calendar className="w-3 h-3" />
                                <time>{formattedDate}</time>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
