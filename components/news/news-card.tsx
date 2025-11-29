import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/types/news';
import { Calendar, ExternalLink, Globe } from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

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

    const CardContent = (
        <div className={`group block bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default`}>
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

                        {/* Summary Bullets Preview - Only show 1 if not compact AND not translated (since translated shows on hover) */}
                        {!compact && !news.isTranslated && news.summaryBullets && news.summaryBullets.length > 0 && (
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
        </div>
    );

    if (news.isTranslated) {
        return (
            <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                    {CardContent}
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))]">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-4 bg-[hsl(var(--primary))] rounded-full" />
                            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Resumo Rápido</h4>
                        </div>
                        {news.summaryBullets && news.summaryBullets.length > 0 ? (
                            <ul className="space-y-2">
                                {news.summaryBullets.map((bullet, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[hsl(var(--primary))] shrink-0 opacity-50" />
                                        <span className="leading-relaxed">{bullet.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Resumo indisponível.</p>
                        )}
                        <div className="pt-2 border-t border-[hsl(var(--border))] flex justify-end">
                            <Link
                                href={`/news/${news.id}`}
                                className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                            >
                                Ler completa <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    }

    // Fallback for non-translated news: Link to external source
    return (
        <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            {CardContent}
        </a>
    );
}
