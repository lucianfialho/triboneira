'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Tv, Smartphone, Check, ChevronRight, Play, Grid3x3, Zap } from 'lucide-react';

export default function DownloadPage() {
    const [copied, setCopied] = useState(false);

    const copyInstallCommand = () => {
        navigator.clipboard.writeText('https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            {/* Header */}
            <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <ChevronRight className="w-5 h-5 rotate-180" />
                            <span className="font-semibold">Voltar</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-16 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
                        <Tv className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Entrega Newba para Android TV
                    </h1>

                    <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                        Transforme sua TV em uma central de multistream. Assista várias lives simultaneamente com qualidade profissional.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk"
                            className="px-8 py-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <Download className="w-6 h-6" />
                            Baixar APK (v1.0.0)
                        </a>

                        <button
                            onClick={copyInstallCommand}
                            className="px-6 py-4 rounded-xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Link copiado!</span>
                                </>
                            ) : (
                                <>
                                    <Smartphone className="w-5 h-5" />
                                    <span>Copiar link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 px-4 bg-[hsl(var(--surface))]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Por que usar na TV?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                <Grid3x3 className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Layouts Flexíveis</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                Grade, PiP, horizontal e muito mais. Escolha o layout perfeito para suas lives.
                            </p>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Tv className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Controle Remoto</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                Navegue com as setas do controle. Interface otimizada para uso com D-pad.
                            </p>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Zero Lag</h3>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                Streams direto dos players oficiais. Twitch, YouTube e Kick em qualidade máxima.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Installation Steps */}
            <section className="py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Como instalar</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Baixe o APK</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                    Abra o navegador da sua Android TV e acesse <code className="px-2 py-1 bg-[hsl(var(--surface))] rounded">entreganewba.com.br/download</code>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Habilite fontes desconhecidas</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                    Vá em <strong>Configurações → Segurança</strong> e ative "Fontes desconhecidas" para o navegador.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Instale o app</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                    Abra o arquivo APK baixado e siga as instruções na tela.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                ✓
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Pronto!</h3>
                                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                    O app vai aparecer na tela inicial da sua TV. É só abrir e aproveitar!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 px-4 bg-[hsl(var(--surface))]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>

                    <div className="space-y-4">
                        <details className="glass-card p-4 rounded-lg cursor-pointer">
                            <summary className="font-semibold">Quais TVs são compatíveis?</summary>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
                                Qualquer Android TV (Sony, Philips, TCL, Xiaomi, etc.). Não funciona em TVs Samsung (Tizen) ou LG (webOS) nativas, mas funciona se tiverem Android/Google TV.
                            </p>
                        </details>

                        <details className="glass-card p-4 rounded-lg cursor-pointer">
                            <summary className="font-semibold">É seguro instalar APK?</summary>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
                                Sim! O APK está hospedado no GitHub Releases oficial do projeto. É código aberto e pode ser auditado por qualquer pessoa.
                            </p>
                        </details>

                        <details className="glass-card p-4 rounded-lg cursor-pointer">
                            <summary className="font-semibold">Como atualizar o app?</summary>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
                                Baixe a versão nova do APK e instale por cima. Suas configurações serão mantidas.
                            </p>
                        </details>

                        <details className="glass-card p-4 rounded-lg cursor-pointer">
                            <summary className="font-semibold">Precisa de internet rápida?</summary>
                            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
                                Sim. Para assistir múltiplas lives em Full HD, recomendamos conexão de 50 Mbps ou mais.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-8">
                        Baixe agora e transforme sua TV em uma central de multistream profissional.
                    </p>

                    <a
                        href="https://github.com/lucianfialho/triboneira/releases/latest/download/app-release-signed.apk"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <Download className="w-6 h-6" />
                        Baixar para Android TV
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[hsl(var(--border))] py-8 px-4">
                <div className="max-w-7xl mx-auto text-center text-sm text-[hsl(var(--muted-foreground))]">
                    <p>Entrega Newba © 2025 • Do newba ao pro</p>
                    <p className="mt-2">
                        <Link href="/" className="hover:text-[hsl(var(--foreground))] transition-colors">
                            Voltar para o app
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
