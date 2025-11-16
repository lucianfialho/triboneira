import { Metadata } from 'next';
import Link from 'next/link';
import { Video, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre - Entrega Newba',
  description: 'Conheça o Entrega Newba, a plataforma para assistir múltiplas lives simultaneamente da Twitch, YouTube e Kick.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(217_91%_60%)] flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Sobre o Entrega Newba</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Assista múltiplas lives ao mesmo tempo
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">O que é?</h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              O Entrega Newba é uma plataforma web gratuita que permite assistir múltiplas transmissões ao vivo
              simultaneamente de diferentes plataformas de streaming como Twitch, YouTube e Kick. Ideal para quem
              gosta de acompanhar vários streamers ao mesmo tempo ou comparar diferentes perspectivas de um mesmo evento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Principais Recursos</h2>
            <ul className="space-y-3 text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Multi-plataforma:</strong> Suporte para Twitch, YouTube e Kick</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Layouts flexíveis:</strong> Grid 2x2, 3x3, horizontal, vertical e picture-in-picture</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Descoberta de conteúdo:</strong> Top Lives em tempo real e busca integrada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Controles individuais:</strong> Mute, volume e fullscreen para cada stream</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Compartilhamento:</strong> Salve e compartilhe seu setup de streams via URL</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)]">•</span>
                <span><strong className="text-[hsl(var(--foreground))]">Command Palette:</strong> Busca rápida com Cmd+K (ou Ctrl+K)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Como usar?</h2>
            <ol className="space-y-3 text-[hsl(var(--muted-foreground))]">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)] font-bold">1.</span>
                <span>Clique em um dos streamers sugeridos em "Top Lives" ou busque pelo nome usando Cmd+K</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)] font-bold">2.</span>
                <span>Adicione quantas lives quiser - você pode assistir até 9 ao mesmo tempo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)] font-bold">3.</span>
                <span>Escolha o layout que preferir e ajuste os controles individuais</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(217_91%_60%)] font-bold">4.</span>
                <span>Compartilhe seu setup com amigos usando o botão de compartilhar</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Gratuito e Open Source</h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              O Entrega Newba é totalmente gratuito para uso. Não cobramos nada e não exigimos cadastro.
              Nosso objetivo é proporcionar a melhor experiência para assistir múltiplas lives simultaneamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contato</h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              Tem sugestões, encontrou algum problema ou quer entrar em contato?
              Envie um e-mail para: <a href="mailto:contato@entreganewba.com.br" className="text-[hsl(217_91%_60%)] hover:underline">contato@entreganewba.com.br</a>
            </p>
          </section>

          <section className="pt-8 border-t border-[hsl(var(--border))]">
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
