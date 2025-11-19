import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Play, Layout, Keyboard, Share2, Volume2, Search, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Guias e Tutoriais - Entrega Newba',
    description: 'Aprenda a usar todos os recursos do Entrega Newba com nossos guias detalhados. Do básico ao avançado.',
};

const guides = [
    {
        title: 'Como Começar: Seu Primeiro Setup',
        description: 'Aprenda a adicionar suas primeiras lives e configurar um setup básico em minutos.',
        icon: Play,
        slug: 'primeiro-setup',
        difficulty: 'Iniciante',
        readTime: '3 min',
    },
    {
        title: 'Guia Completo de Layouts',
        description: 'Entenda todos os 5 tipos de layout disponíveis e quando usar cada um.',
        icon: Layout,
        slug: 'layouts',
        difficulty: 'Iniciante',
        readTime: '5 min',
    },
    {
        title: 'Dominando o Command Palette',
        description: 'Use atalhos de teclado para adicionar streams 10x mais rápido.',
        icon: Keyboard,
        slug: 'command-palette',
        difficulty: 'Intermediário',
        readTime: '4 min',
    },
    {
        title: 'Compartilhando Seu Setup',
        description: 'Salve e compartilhe suas configurações favoritas com amigos.',
        icon: Share2,
        slug: 'compartilhar',
        difficulty: 'Iniciante',
        readTime: '2 min',
    },
    {
        title: 'Gerenciando Áudio de Múltiplos Streams',
        description: 'Técnicas e dicas para controlar o áudio sem enlouquecer.',
        icon: Volume2,
        slug: 'audio',
        difficulty: 'Iniciante',
        readTime: '4 min',
    },
    {
        title: 'Descobrindo Novos Streamers',
        description: 'Use Top Lives e busca para encontrar conteúdo novo e interessante.',
        icon: Search,
        slug: 'descobrir',
        difficulty: 'Iniciante',
        readTime: '3 min',
    },
    {
        title: 'Otimizando Performance',
        description: 'Dicas para assistir múltiplos streams sem travar seu navegador.',
        icon: Zap,
        slug: 'performance',
        difficulty: 'Avançado',
        readTime: '6 min',
    },
];

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'Iniciante':
            return 'bg-green-500/10 text-green-400 border-green-500/20';
        case 'Intermediário':
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case 'Avançado':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};

export default function GuidesPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o início
                </Link>

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-[hsl(217_91%_60%)] flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Guias e Tutoriais</h1>
                        <p className="text-[hsl(var(--muted-foreground))] mt-1">
                            Aprenda a dominar todos os recursos do Entrega Newba
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides.map((guide) => {
                        const Icon = guide.icon;
                        return (
                            <Link
                                key={guide.slug}
                                href={`/guides/${guide.slug}`}
                                className="group"
                            >
                                <Card className="h-full border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-elevated))] transition-all hover:scale-[1.02] cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[hsl(217_91%_60%)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold mb-2 group-hover:text-[hsl(217_91%_60%)] transition-colors">
                                                    {guide.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                                            {guide.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-1 rounded-md border ${getDifficultyColor(guide.difficulty)}`}>
                                                {guide.difficulty}
                                            </span>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {guide.readTime} de leitura
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                <section className="mt-16 glass-card p-8">
                    <h2 className="text-2xl font-bold mb-4">Precisa de ajuda específica?</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Confira nossa seção de Perguntas Frequentes ou entre em contato diretamente.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <Link
                            href="/faq"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[hsl(217_91%_60%)] text-white font-medium hover:bg-[hsl(217_91%_55%)] transition-colors"
                        >
                            Ver FAQ
                        </Link>
                        <a
                            href="mailto:contato@entreganewba.com.br"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--surface-elevated))] transition-colors"
                        >
                            Enviar e-mail
                        </a>
                    </div>
                </section>

                <section className="pt-8 border-t border-[hsl(var(--border))] mt-8">
                    <div className="flex gap-4">
                        <Link
                            href="/about"
                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            Sobre
                        </Link>
                        <Link
                            href="/faq"
                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            Política de Privacidade
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
