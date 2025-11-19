import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Perguntas Frequentes (FAQ) - Entrega Newba',
    description: 'Tire suas dúvidas sobre como usar o Entrega Newba, assistir múltiplas lives, configurar layouts e muito mais.',
};

const faqs = {
    'Começando': [
        {
            question: 'O que é o Entrega Newba?',
            answer: 'O Entrega Newba é uma plataforma web gratuita que permite assistir múltiplas transmissões ao vivo simultaneamente. Você pode adicionar streams da Twitch, YouTube e Kick, organizá-los em diferentes layouts e controlar cada um individualmente. É perfeito para quem gosta de acompanhar vários streamers ao mesmo tempo ou comparar diferentes perspectivas de um evento.',
        },
        {
            question: 'Preciso criar uma conta para usar?',
            answer: 'Não! O Entrega Newba não exige cadastro ou login. Basta acessar o site e começar a adicionar seus streamers favoritos. Suas preferências são salvas localmente no seu navegador.',
        },
        {
            question: 'É realmente gratuito?',
            answer: 'Sim, 100% gratuito! Não cobramos nada e não há planos premium. Nosso objetivo é oferecer a melhor experiência para assistir múltiplas lives sem custos.',
        },
        {
            question: 'Como adiciono minha primeira live?',
            answer: 'Existem três formas: 1) Clique em um dos streamers sugeridos na seção "Top Lives" da barra lateral. 2) Use o Command Palette (Cmd+K ou Ctrl+K) para buscar por nome. 3) Cole a URL completa de uma live no campo "Add Stream" e clique em "Add Stream".',
        },
    ],
    'Recursos e Funcionalidades': [
        {
            question: 'Quantas lives posso assistir ao mesmo tempo?',
            answer: 'Você pode adicionar até 9 lives simultaneamente. O limite existe para garantir boa performance e qualidade de visualização. Para a maioria dos usuários, 4-6 streams já proporciona uma excelente experiência.',
        },
        {
            question: 'Como funciona o sistema de layouts?',
            answer: 'O Entrega Newba oferece 5 tipos de layout: Single (1 stream em tela cheia), PiP (1 principal + 1 pequeno sobreposto), Sidebar (1 principal + outros na lateral), Focused (1 grande + grid de menores) e Grid (todos em tamanho igual). Você pode alternar entre layouts a qualquer momento clicando nos ícones na barra lateral.',
        },
        {
            question: 'O que é o Command Palette?',
            answer: 'O Command Palette é uma ferramenta de busca rápida que você abre com Cmd+K (Mac) ou Ctrl+K (Windows/Linux). Com ele, você pode buscar streamers por nome em tempo real, ver quem está ao vivo e adicionar streams instantaneamente sem precisar colar URLs.',
        },
        {
            question: 'Como funciona o controle de áudio?',
            answer: 'Por padrão, apenas o primeiro stream adicionado tem áudio ativo. Para alternar o áudio, clique em qualquer outro stream e ele se tornará o único com som (Solo Audio). Você também pode pausar o mouse sobre um stream mutado por 2 segundos para ativá-lo automaticamente.',
        },
        {
            question: 'Posso assistir YouTube lives e vídeos?',
            answer: 'Sim! O Entrega Newba suporta tanto lives ao vivo quanto vídeos do YouTube. Basta colar a URL completa do vídeo ou usar o Command Palette para buscar canais.',
        },
        {
            question: 'Como compartilho meu setup com amigos?',
            answer: 'Clique no botão "Compartilhar" na barra lateral. Isso gera uma URL única que inclui todos os streams que você adicionou e o layout escolhido. Qualquer pessoa que abrir esse link verá exatamente o mesmo setup que você configurou.',
        },
        {
            question: 'Meu setup é salvo automaticamente?',
            answer: 'Sim! Todas as suas configurações (streams adicionados, layout escolhido, estado de mute) são salvas automaticamente no localStorage do seu navegador. Quando você voltar ao site, encontrará tudo como deixou.',
        },
        {
            question: 'Como vejo quantas pessoas estão assistindo cada stream?',
            answer: 'O número de espectadores aparece em tempo real no canto superior direito de cada stream, junto com um ícone de olho. Também mostramos o total de espectadores de todos os seus streams na barra lateral.',
        },
    ],
    'Plataformas Suportadas': [
        {
            question: 'Quais plataformas são suportadas?',
            answer: 'Atualmente suportamos Twitch, YouTube (lives e vídeos) e Kick. Estamos sempre avaliando adicionar novas plataformas baseado no feedback dos usuários.',
        },
        {
            question: 'Posso misturar streams de diferentes plataformas?',
            answer: 'Com certeza! Você pode adicionar quantos streams quiser de qualquer plataforma suportada. Por exemplo, pode assistir 2 streamers da Twitch, 1 do YouTube e 1 da Kick ao mesmo tempo.',
        },
        {
            question: 'Por que alguns streamers não aparecem na busca?',
            answer: 'A busca mostra apenas streamers que estão ao vivo no momento. Se você conhece a URL do canal, pode sempre colar diretamente no campo "Add Stream" para adicionar manualmente.',
        },
    ],
    'Problemas Técnicos': [
        {
            question: 'O stream não carrega ou fica em buffering constante',
            answer: 'Isso geralmente acontece por limitações de banda. Tente reduzir o número de streams simultâneos ou diminuir a qualidade de vídeo nas configurações de cada player. Streams em 1080p60fps consomem muita banda - considere usar 720p ou 480p em alguns deles.',
        },
        {
            question: 'Meu navegador está lento ao assistir 4+ streams',
            answer: 'Streaming de múltiplos vídeos exige bastante processamento. Recomendações: 1) Use navegadores otimizados como Chrome ou Edge. 2) Feche outras abas e programas. 3) Reduza a qualidade dos vídeos. 4) Use layouts que mostrem menos streams em tela cheia simultaneamente.',
        },
        {
            question: 'O áudio não está funcionando',
            answer: 'Verifique: 1) Se o stream não está mutado (ícone de volume no canto). 2) Se o volume do navegador está habilitado. 3) Se você deu permissão de autoplay ao site. Alguns navegadores bloqueiam autoplay com áudio - clique no stream para ativar.',
        },
        {
            question: 'A Twitch diz "player error" ou não carrega',
            answer: 'Isso pode acontecer se o canal estiver offline ou se houver restrições de embed. Certifique-se de que o canal está realmente ao vivo e que o streamer permite embedding do seu conteúdo.',
        },
        {
            question: 'Perdi meu setup após limpar histórico do navegador',
            answer: 'Infelizmente, ao limpar dados do site (cookies e localStorage), você perde suas configurações salvas. Para evitar isso, use a função "Compartilhar" para gerar um link do seu setup e salve-o em um gerenciador de favoritos.',
        },
        {
            question: 'Qual navegador funciona melhor?',
            answer: 'Recomendamos Google Chrome ou Microsoft Edge para melhor performance. Firefox também funciona bem. Safari no Mac pode ter algumas limitações com autoplay de vídeos.',
        },
    ],
    'Privacidade e Dados': [
        {
            question: 'Vocês coletam meus dados pessoais?',
            answer: 'Não coletamos dados pessoais identificáveis. Usamos analytics anônimos (Google Analytics e Amplitude) para entender como o site é usado e melhorar a experiência. Veja nossa Política de Privacidade completa para detalhes.',
        },
        {
            question: 'Meu histórico de visualização fica salvo?',
            answer: 'Não mantemos histórico de visualização em nossos servidores. Apenas salvamos suas preferências localmente no seu navegador. Ninguém além de você tem acesso a quais streams você assistiu.',
        },
        {
            question: 'Vocês compartilham dados com as plataformas de streaming?',
            answer: 'Não. Quando você assiste um stream, você está interagindo diretamente com o player da plataforma (Twitch, YouTube, Kick). Eles podem coletar dados de visualização conforme suas próprias políticas, mas nós não compartilhamos nada com eles.',
        },
    ],
    'Outros': [
        {
            question: 'Posso usar no celular?',
            answer: 'O site é responsivo e funciona em dispositivos móveis, mas a experiência é otimizada para desktop/tablet. Assistir múltiplos streams em telas pequenas pode não ser ideal. Recomendamos usar em tablets ou computadores.',
        },
        {
            question: 'Vocês têm app nativo?',
            answer: 'No momento não temos apps para iOS ou Android. O Entrega Newba é uma aplicação web que funciona diretamente no navegador.',
        },
        {
            question: 'Como posso ajudar o projeto?',
            answer: 'Compartilhe o Entrega Newba com amigos que gostam de streaming! Nosso crescimento é 100% orgânico. Se tiver sugestões de funcionalidades ou encontrar bugs, envie um e-mail para contato@entreganewba.com.br.',
        },
        {
            question: 'Vão adicionar recurso X?',
            answer: 'Estamos sempre trabalhando em melhorias! Algumas funcionalidades no roadmap incluem: chat agregado, themes personalizáveis, e integração com mais plataformas. Entre em contato com suas sugestões!',
        },
        {
            question: 'O site funciona offline?',
            answer: 'Não. Como dependemos de streams ao vivo de outras plataformas, você precisa estar conectado à internet para usar o Entrega Newba.',
        },
    ],
};

export default function FAQPage() {
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
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Perguntas Frequentes</h1>
                        <p className="text-[hsl(var(--muted-foreground))] mt-1">
                            Tire todas as suas dúvidas sobre o Entrega Newba
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {Object.entries(faqs).map(([category, questions]) => (
                        <section key={category}>
                            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-2">
                                <div className="w-2 h-8 bg-[hsl(217_91%_60%)] rounded-full" />
                                {category}
                            </h2>
                            <div className="space-y-6">
                                {questions.map((faq, index) => (
                                    <details
                                        key={index}
                                        className="group glass-card p-6 cursor-pointer hover:bg-[hsl(var(--surface-elevated))] transition-all"
                                    >
                                        <summary className="flex items-start justify-between gap-4 list-none">
                                            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] flex-1">
                                                {faq.question}
                                            </h3>
                                            <ChevronDown className="w-5 h-5 text-[hsl(var(--muted-foreground))] flex-shrink-0 transition-transform group-open:rotate-180 mt-1" />
                                        </summary>
                                        <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed pl-0">
                                            {faq.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <section className="mt-16 glass-card p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Não encontrou sua resposta?</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Entre em contato conosco e teremos prazer em ajudar!
                    </p>
                    <a
                        href="mailto:contato@entreganewba.com.br"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[hsl(217_91%_60%)] text-white font-medium hover:bg-[hsl(217_91%_55%)] transition-colors"
                    >
                        Enviar e-mail
                    </a>
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
    );
}
