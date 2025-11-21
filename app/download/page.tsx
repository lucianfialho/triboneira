'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Tv, Check, ChevronLeft, Grid3x3, Zap } from 'lucide-react';

export default function DownloadPage() {
    const [copied, setCopied] = useState(false);

    const copyInstallCommand = () => {
        navigator.clipboard.writeText('https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {/* Back Button */}
            <div className="p-4 lg:p-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">Voltar</span>
                </Link>
            </div>

            {/* Hero Section - 2 Columns */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div>
                        {/* Logo */}
                        <Link href="/" className="inline-block mb-6">
                            <Image
                                src="/android-chrome-192x192.png"
                                alt="Entrega Newba"
                                width={56}
                                height={56}
                                className="rounded-xl"
                                unoptimized
                            />
                        </Link>

                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            <span className="gradient-text">Entrega Newba</span>
                            <br />
                            <span className="text-3xl lg:text-4xl text-[hsl(var(--muted-foreground))]">
                                para Android TV
                            </span>
                        </h1>

                        <p className="text-xl text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
                            A forma mais profissional de assistir <strong className="text-[hsl(var(--foreground))]">múltiplas lives simultaneamente</strong> na sua TV
                        </p>

                        <div className="flex items-center gap-3 text-sm text-[hsl(var(--subtle-foreground))] mb-8">
                            <span className="px-3 py-1 rounded-full bg-[hsl(var(--surface-elevated))]">Twitch</span>
                            <span className="px-3 py-1 rounded-full bg-[hsl(var(--surface-elevated))]">YouTube</span>
                            <span className="px-3 py-1 rounded-full bg-[hsl(var(--surface-elevated))]">Kick</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <a
                                href="https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            >
                                <Download className="w-5 h-5" />
                                Baixar para Android TV
                            </a>

                            <button
                                onClick={copyInstallCommand}
                                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span>Link copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📋</span>
                                        <span>Copiar link</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-[hsl(var(--subtle-foreground))]">
                            Versão 1.0.0 • 12 MB • Grátis • Código aberto
                        </p>
                    </div>

                    {/* Right Column - Screenshot */}
                    <div className="relative">
                        <div className="glass-card p-3 rounded-2xl">
                            <Image
                                src="/screenshot-app.png"
                                alt="Screenshot do Entrega Newba mostrando 4 lives simultâneas"
                                width={1024}
                                height={576}
                                className="rounded-xl w-full h-auto shadow-2xl"
                                priority
                            />
                        </div>
                        {/* Decorative gradient */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-3xl rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 lg:px-8">
                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                            <Grid3x3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Vários Layouts</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Grade 2x2, PiP, horizontal ou focado. Organize as lives do seu jeito.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                            <Tv className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">100% Otimizado para TV</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Controle tudo com as setas do controle remoto. Sem mouse, sem complicação.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Players Oficiais</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Qualidade máxima direto dos servidores Twitch, YouTube e Kick.
                        </p>
                    </div>
                </div>

                {/* Installation */}
                <div className="glass-card p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Como instalar</h2>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(217_91%_60%)] text-white flex items-center justify-center font-bold text-sm">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Baixe o APK</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Abra o navegador da TV e acesse <code className="px-2 py-0.5 bg-[hsl(var(--surface-elevated))] rounded text-xs">entreganewba.com.br/download</code>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(217_91%_60%)] text-white flex items-center justify-center font-bold text-sm">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Habilite instalação</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Configurações → Segurança → Ative "Fontes desconhecidas"
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(217_91%_60%)] text-white flex items-center justify-center font-bold text-sm">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Instale</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Abra o APK e siga as instruções
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                                ✓
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Pronto!</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    App na tela inicial da TV
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>

                    <div className="space-y-4">
                        <details className="group">
                            <summary className="font-semibold cursor-pointer hover:text-[hsl(var(--primary))] transition-colors">
                                Quais TVs são compatíveis?
                            </summary>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 pl-4">
                                Qualquer Android TV (Sony, Philips, TCL, Xiaomi, etc.)
                            </p>
                        </details>

                        <div className="border-t border-[hsl(var(--border))]"></div>

                        <details className="group">
                            <summary className="font-semibold cursor-pointer hover:text-[hsl(var(--primary))] transition-colors">
                                É seguro?
                            </summary>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 pl-4">
                                Sim! APK hospedado no GitHub oficial. Código aberto.
                            </p>
                        </details>

                        <div className="border-t border-[hsl(var(--border))]"></div>

                        <details className="group">
                            <summary className="font-semibold cursor-pointer hover:text-[hsl(var(--primary))] transition-colors">
                                Como atualizar?
                            </summary>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 pl-4">
                                Baixe a nova versão e instale por cima. Configurações mantidas.
                            </p>
                        </details>

                        <div className="border-t border-[hsl(var(--border))]"></div>

                        <details className="group">
                            <summary className="font-semibold cursor-pointer hover:text-[hsl(var(--primary))] transition-colors">
                                Internet necessária?
                            </summary>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 pl-4">
                                Recomendado 50 Mbps+ para múltiplas lives em Full HD.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-[hsl(var(--muted-foreground))]">
                    <p>Entrega Newba © 2025 • Do newba ao pro</p>
                </div>
            </div>
        </div>
    );
}
