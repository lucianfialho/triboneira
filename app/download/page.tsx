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
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-6"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm">Voltar</span>
                    </Link>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                            <Tv className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">
                            App para Android TV
                        </h1>

                        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                            Transforme sua TV em uma central de multistream profissional
                        </p>
                    </div>
                </div>

                {/* Screenshot */}
                <div className="glass-card p-4 mb-8 overflow-hidden">
                    <Image
                        src="/screenshot-app.png"
                        alt="Screenshot do app mostrando múltiplas lives"
                        width={1024}
                        height={576}
                        className="rounded-lg w-full h-auto"
                        priority
                    />
                </div>

                {/* Download Card */}
                <div className="glass-card p-8 mb-8 text-center">
                    <a
                        href="https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mb-4"
                    >
                        <Download className="w-5 h-5" />
                        Baixar APK (v1.0.0)
                    </a>

                    <button
                        onClick={copyInstallCommand}
                        className="block mx-auto text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        {copied ? (
                            <span className="inline-flex items-center gap-2 text-green-500">
                                <Check className="w-4 h-4" />
                                Link copiado!
                            </span>
                        ) : (
                            'Copiar link de download'
                        )}
                    </button>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                            <Grid3x3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Layouts Flexíveis</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Grade, PiP, horizontal e mais. Escolha o layout ideal.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                            <Tv className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Controle Remoto</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Interface otimizada para navegação com D-pad.
                        </p>
                    </div>

                    <div className="glass-card p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Máxima Qualidade</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Players oficiais Twitch, YouTube e Kick.
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
