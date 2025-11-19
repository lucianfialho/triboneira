import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Play, Plus, Layout as LayoutIcon, Check } from 'lucide-react';
import { notFound } from 'next/navigation';

const guides: Record<string, {
    title: string;
    description: string;
    content: {
        section: string;
        steps?: { title: string; description: string; tip?: string }[];
        text?: string;
    }[];
}> = {
    'primeiro-setup': {
        title: 'Como Começar: Seu Primeiro Setup',
        description: 'Aprenda a adicionar suas primeiras lives e configurar um setup básico em minutos.',
        content: [
            {
                section: 'Introdução',
                text: 'Bem-vindo ao Entrega Newba! Este guia vai te ajudar a criar seu primeiro setup de múltiplos streams em menos de 5 minutos. Ao final, você estará assistindo vários streamers simultaneamente como um profissional.',
            },
            {
                section: 'Passo a Passo',
                steps: [
                    {
                        title: 'Acesse a página principal',
                        description: 'Entre em entreganewba.com.br. Você verá uma barra lateral à esquerda com sugestões de streamers ao vivo e um campo para adicionar streams.',
                    },
                    {
                        title: 'Escolha seu primeiro stream',
                        description: 'Você tem três opções: 1) Clique em qualquer streamer da lista "Top Lives" na barra lateral. 2) Pressione Cmd+K (Mac) ou Ctrl+K (Windows) para abrir o Command Palette e busque por nome. 3) Cole a URL completa de uma live da Twitch, YouTube ou Kick no campo "Add Stream".',
                        tip: 'Para iniciantes, recomendamos começar com a opção 1 - simplesmente clique em um streamer da lista Top Lives!',
                    },
                    {
                        title: 'Adicione mais streams',
                        description: 'Repita o processo anterior para adicionar mais lives. Você pode misturar streamers de diferentes plataformas (Twitch, YouTube, Kick) no mesmo setup.',
                        tip: 'Comece com 2-3 streams. Você pode adicionar mais depois de se familiarizar com a interface.',
                    },
                    {
                        title: 'Escolha seu layout',
                        description: 'Na barra lateral, você verá ícones de diferentes layouts. Clique neles para alternar entre Grid (todos iguais), Sidebar (1 principal + lateral), PiP (picture-in-picture) e outros. Experimente para ver qual prefere!',
                    },
                    {
                        title: 'Controle o áudio',
                        description: 'Por padrão, apenas o primeiro stream tem áudio ativo. Para trocar o áudio, clique em qualquer outro stream. Você também pode pausar o mouse sobre um stream mutado por 2 segundos para ativá-lo automaticamente.',
                        tip: 'O botão de volume no canto de cada stream mostra se ele está com áudio ativo (azul) ou mutado (cinza).',
                    },
                    {
                        title: 'Salve seu setup (opcional)',
                        description: 'Suas configurações são salvas automaticamente no navegador. Se quiser compartilhar com amigos, clique no botão "Compartilhar" na barra lateral para gerar um link único.',
                    },
                ],
            },
            {
                section: 'Dicas Importantes',
                text: '• Seu setup é salvo automaticamente - quando voltar, encontrará tudo como deixou.\n\n• Use Cmd+K (ou Ctrl+K) para buscar streamers rapidamente sem sair da página.\n\n• Clique no ícone de "olho" para ver quantos espectadores cada stream tem.\n\n• Para remover um stream, clique com botão direito nele e selecione "Remover".\n\n• Se os vídeos travarem, tente reduzir a qualidade nas configurações de cada player.',
            },
            {
                section: 'Próximos Passos',
                text: 'Agora que você criou seu primeiro setup, explore nossos outros guias:\n\n• Guia Completo de Layouts - entenda quando usar cada tipo de layout\n\n• Dominando o Command Palette - adicione streams 10x mais rápido\n\n• Gerenciando Áudio de Múltiplos Streams - técnicas avançadas de controle',
            },
        ],
    },
    'layouts': {
        title: 'Guia Completo de Layouts',
        description: 'Entenda todos os 5 tipos de layout disponíveis e quando usar cada um para maximizar sua experiência.',
        content: [
            {
                section: 'Visão Geral',
                text: 'O Entrega Newba oferece 5 layouts diferentes, cada um otimizado para cenários específicos. Escolher o layout certo pode transformar completamente sua experiência de visualização.',
            },
            {
                section: 'Tipos de Layout',
                steps: [
                    {
                        title: '1. Single (Stream Único)',
                        description: 'Um stream em tela cheia. Perfeito quando você quer focar em apenas uma live, mas mantém a facilidade de alternar rapidamente para outros streams salvos.',
                        tip: 'Use quando quiser assistir a um evento importante com atenção total, mas tendo outros streams prontos para alternar.',
                    },
                    {
                        title: '2. PiP (Picture-in-Picture)',
                        description: 'Um stream principal grande com outro menor sobreposto no canto. Ideal para assistir sua live favorita enquanto acompanha outra de relance.',
                        tip: 'Perfeito para torneios onde você quer focar em um jogador mas ver o que está acontecendo com outro.',
                    },
                    {
                        title: '3. Sidebar (Barra Lateral)',
                        description: 'Um stream principal ocupando a maior parte da tela, com outros streams menores organizados verticalmente na lateral. Ótimo para 2-4 streams.',
                        tip: 'Use quando tiver um streamer "principal" mas quiser acompanhar reações ou perspectivas alternativas.',
                    },
                    {
                        title: '4. Focused (Focado)',
                        description: 'Um stream grande na parte superior com os demais organizados em grid pequeno abaixo. Balanceia atenção principal com consciência periférica.',
                        tip: 'Excelente para eventos com múltiplas POVs - foco no streamer principal com outros visíveis.',
                    },
                    {
                        title: '5. Grid (Grade)',
                        description: 'Todos os streams em tamanhos iguais, organizados em grid 2x2, 2x3 ou 3x3 dependendo da quantidade. Democrático e equilibrado.',
                        tip: 'Ideal quando todos os streams têm importância igual ou quando você quer comparar jogadores lado a lado.',
                    },
                ],
            },
            {
                section: 'Quando Usar Cada Layout',
                text: '**2 Streams:** Sidebar ou PiP funcionam melhor. Grid 2x1 também é uma ótima opção.\n\n**3 Streams:** Focused oferece melhor balanço. Grid 2x2 (com um espaço vazio) também funciona.\n\n**4 Streams:** Grid 2x2 é perfeito. Sidebar também funciona se você tem um favorito claro.\n\n**5-6 Streams:** Focused ou Grid são suas melhores opções.\n\n**7-9 Streams:** Grid 3x3 é praticamente obrigatório para caber todos na tela.',
            },
            {
                section: 'Dicas de Performance',
                text: '• Layouts com streams menores consomem menos recursos - use Sidebar ou Focused se estiver tendo problemas de performance.\n\n• Grid com muitos streams (6+) pode ser pesado. Considere reduzir a qualidade dos vídeos.\n\n• Você pode alternar entre layouts a qualquer momento - experimente até encontrar o ideal!',
            },
        ],
    },
    'command-palette': {
        title: 'Dominando o Command Palette',
        description: 'Use atalhos de teclado para adicionar streams 10x mais rápido e navegar como um profissional.',
        content: [
            {
                section: 'O que é o Command Palette?',
                text: 'O Command Palette é uma ferramenta de busca rápida inspirada em editores de código modernos. Com ele, você pode encontrar e adicionar streamers em segundos, sem precisar sair da página ou copiar URLs.',
            },
            {
                section: 'Como Acessar',
                steps: [
                    {
                        title: 'Atalho de Teclado',
                        description: 'Pressione Cmd+K no Mac ou Ctrl+K no Windows/Linux. Uma janela de busca aparecerá sobreposta à tela.',
                        tip: 'Este atalho funciona de qualquer lugar do site, mesmo quando você está assistindo streams!',
                    },
                    {
                        title: 'Clique no Campo de Adicionar',
                        description: 'Clicar no campo "Paste stream URL..." na barra lateral também abre o Command Palette automaticamente.',
                    },
                ],
            },
            {
                section: 'Usando a Busca',
                steps: [
                    {
                        title: 'Digite o nome do streamer',
                        description: 'Comece a digitar o nome de usuário ou nome de exibição de qualquer streamer. A busca é instantânea e mostra resultados conforme você digita.',
                        tip: 'Você não precisa digitar o nome completo - "gau" já encontra "Gaules", por exemplo.',
                    },
                    {
                        title: 'Navegue com teclado',
                        description: 'Use as setas ↑ e ↓ para navegar pelos resultados. Pressione Enter para adicionar o streamer selecionado.',
                    },
                    {
                        title: 'Ou clique',
                        description: 'Se preferir, você pode clicar diretamente em qualquer resultado da busca.',
                    },
                ],
            },
            {
                section: 'Recursos Avançados',
                text: '**Filtro por Plataforma:** Os resultados mostram ícones de plataforma (Twitch, YouTube, Kick) para você identificar rapidamente.\n\n**Só Streamers Ao Vivo:** Por padrão, a busca mostra apenas streamers que estão transmitindo no momento.\n\n**Informações em Tempo Real:** Número de espectadores e título da live aparecem nos resultados.\n\n**Evita Duplicatas:** Streamers que você já adicionou não aparecem nos resultados.',
            },
            {
                section: 'Dicas Pro',
                text: '• Use ESC para fechar o Command Palette rapidamente.\n\n• Você pode abrir e fechar múltiplas vezes - suas buscas anteriores não são salvas.\n\n• Para streamers menos conhecidos, tente buscar partes do nome ou o nome de exibição.\n\n• Se não encontrar alguém, use o método tradicional de colar a URL.',
            },
        ],
    },
    'compartilhar': {
        title: 'Compartilhando Seu Setup',
        description: 'Salve e compartilhe suas configurações favoritas de streams com amigos através de um link único.',
        content: [
            {
                section: 'Por Que Compartilhar?',
                text: 'Compartilhar seu setup é perfeito para:\n\n• Assistir eventos com amigos remotamente\n• Recomendar uma combinação específica de streamers\n• Salvar seus setups favoritos como favoritos do navegador\n• Criar "playlists" de conteúdo para momentos específicos',
            },
            {
                section: 'Como Compartilhar',
                steps: [
                    {
                        title: 'Configure seu setup',
                        description: 'Adicione todos os streams que você quer compartilhar e escolha o layout ideal.',
                    },
                    {
                        title: 'Clique em "Compartilhar"',
                        description: 'Na barra lateral, clique no botão "Compartilhar" (ícone de seta).',
                        tip: 'O botão só aparece quando você tem pelo menos um stream adicionado.',
                    },
                    {
                        title: 'Link copiado!',
                        description: 'O link é copiado automaticamente para sua área de transferência. O botão mostra "Copiado!" por alguns segundos para confirmar.',
                    },
                    {
                        title: 'Compartilhe',
                        description: 'Cole o link em qualquer lugar - WhatsApp, Discord, Twitter, etc. Qualquer pessoa que abrir verá exatamente o mesmo setup que você configurou.',
                    },
                ],
            },
            {
                section: 'O Que é Compartilhado?',
                text: '**Incluído no link:**\n• Todos os streams que você adicionou\n• O layout que você escolheu\n• As plataformas de cada stream\n\n**NÃO incluído:**\n• Estado de mute/volume (cada pessoa controla o próprio áudio)\n• Histórico de navegação ou dados pessoais\n• Configurações do navegador',
            },
            {
                section: 'Dicas Úteis',
                text: '• Salve links de setups favoritos nos favoritos do navegador para acesso rápido.\n\n• Crie setups temáticos: "Torneios de LoL", "Speedruns de Sábado", etc.\n\n• Links compartilhados funcionam indefinidamente - você pode usá-los depois.\n\n• Se um streamer estiver offline quando alguém abrir o link, o player mostrará que o canal está offline.',
            },
        ],
    },
    'audio': {
        title: 'Gerenciando Áudio de Múltiplos Streams',
        description: 'Domine o controle de áudio para uma experiência perfeita ao assistir múltiplos streams simultaneamente.',
        content: [
            {
                section: 'O Problema do Áudio',
                text: 'Assistir múltiplos streams simultaneamente pode rapidamente se tornar caótico se todos estiverem com áudio. O Entrega Newba foi projetado para facilitar o controle de qual stream você quer ouvir a cada momento.',
            },
            {
                section: 'Comportamento Padrão',
                steps: [
                    {
                        title: 'Primeiro stream tem áudio',
                        description: 'Quando você adiciona seu primeiro stream, ele começa com áudio ativo automaticamente.',
                    },
                    {
                        title: 'Streams seguintes são mutados',
                        description: 'Todos os streams adicionados depois do primeiro começam mutados. Isso evita que múltiplos áudios toquem ao mesmo tempo.',
                    },
                ],
            },
            {
                section: 'Métodos de Controle',
                steps: [
                    {
                        title: 'Método 1: Solo Audio (Clique)',
                        description: 'Clique em qualquer stream para ativá-lo como "solo" - ele ficará com áudio e todos os outros serão mutados automaticamente.',
                        tip: 'Esta é a forma mais rápida de alternar o áudio entre streams. Um clique e pronto!',
                    },
                    {
                        title: 'Método 2: Hover Automático',
                        description: 'Pause o mouse sobre um stream mutado por 2 segundos. Uma barra de progresso aparecerá e, ao completar, o áudio será ativado automaticamente.',
                        tip: 'Perfeito quando você quer rapidamente ouvir o que está acontecendo em outro stream sem perder sua seleção principal.',
                    },
                    {
                        title: 'Método 3: Botão de Volume',
                        description: 'Clique no ícone de volume no canto do stream para mutar/desmutar individualmente. Streams com áudio têm o ícone azul, mutados têm cinza.',
                    },
                    {
                        title: 'Método 4: Menu de Contexto',
                        description: 'Clique com botão direito em qualquer stream e selecione "Solo Audio" para torná-lo o único com áudio ativo.',
                    },
                ],
            },
            {
                section: 'Cenários Comuns',
                text: '**Eventos competitivos:** Use Solo Audio (clique) para alternar rapidamente entre comentaristas diferentes.\n\n**Watch parties:** Deixe um stream com comentários principais e "ouça" momentaneamente outros com hover.\n\n**Múltiplas POVs:** Escolha um jogador favorito para áudio principal, veja outros com visual.\n\n**Background:** Mute todos exceto seu favorito, deixe outros puramente visuais.',
            },
            {
                section: 'Dicas Profissionais',
                text: '• O ícone de volume azul indica qual stream tem áudio ativo - uma referência visual rápida.\n\n• Hover automático reseta se você mover o mouse - deliberadamente projetado para evitar ativações acidentais.\n\n• Em layouts com streams menores, você ainda pode clicar para ativar o áudio mesmo que seja um stream secundário.\n\n• Considere usar fones com boa separação estéreo para melhor experiência.',
            },
        ],
    },
    'descobrir': {
        title: 'Descobrindo Novos Streamers',
        description: 'Use as ferramentas de descoberta do Entrega Newba para encontrar conteúdo novo e interessante.',
        content: [
            {
                section: 'Ferramentas de Descoberta',
                text: 'O Entrega Newba oferece duas ferramentas principais para descobrir novos streamers: Top Lives e Command Palette. Ambas mostram streamers que estão ao vivo no momento.',
            },
            {
                section: 'Top Lives',
                steps: [
                    {
                        title: 'Onde encontrar',
                        description: 'A seção "Top Lives" aparece na barra lateral quando você não tem streams adicionados. Mostra os 6 streamers mais assistidos no momento.',
                        tip: 'Esta lista é atualizada periodicamente para mostrar sempre o conteúdo mais popular.',
                    },
                    {
                        title: 'Informações mostradas',
                        description: 'Para cada streamer você vê: avatar, nome, plataforma, número de espectadores e título da live.',
                    },
                    {
                        title: 'Como usar',
                        description: 'Simplesmente clique em qualquer streamer da lista para adicioná-lo instantaneamente ao seu setup.',
                        tip: 'Você pode adicionar múltiplos streamers da lista de Top Lives rapidamente.',
                    },
                ],
            },
            {
                section: 'Busca com Command Palette',
                steps: [
                    {
                        title: 'Abra com Cmd+K (Ctrl+K)',
                        description: 'O Command Palette permite buscar qualquer streamer por nome, não apenas os mais populares.',
                    },
                    {
                        title: 'Digite para buscar',
                        description: 'Comece a digitar o nome de usuário ou nome de exibição. A busca mostra resultados em tempo real conforme você digita.',
                    },
                    {
                        title: 'Filtre por plataforma',
                        description: 'Os resultados mostram ícones de plataforma (Twitch/YouTube/Kick) para você filtrar visualmente.',
                    },
                ],
            },
            {
                section: 'Estratégias de Descoberta',
                text: '**Explore Categorias:** Busque por jogos populares + "gameplay" para encontrar streamers daquele jogo.\n\n**Horários Diferentes:** Top Lives muda ao longo do dia - confira em horários diferentes para variedade.\n\n**Plataformas Alternativas:** Não se limite à Twitch - explore YouTube Gaming e Kick para conteúdo único.\n\n**Eventos Especiais:** Durante torneios, Top Lives geralmente mostra múltiplas POVs do mesmo evento.',
            },
            {
                section: 'Construindo Sua Lista',
                text: '• Anote nomes de streamers que você gosta para buscá-los depois.\n\n• Use a função Compartilhar para salvar combinações favoritas de streamers.\n\n• Experimente assistir streamers de plataformas que você normalmente não usa.\n\n• Combine streamers grandes com pequenos para apoiar criadores em crescimento.',
            },
        ],
    },
    'performance': {
        title: 'Otimizando Performance',
        description: 'Dicas e técnicas para assistir múltiplos streams sem sobrecarregar seu navegador ou internet.',
        content: [
            {
                section: 'Entendendo o Consumo',
                text: 'Assistir múltiplos streams simultaneamente exige recursos significativos:\n\n• **Largura de banda:** Cada stream consome dados (1-10 Mbps dependendo da qualidade)\n• **CPU:** Decodificação de múltiplos vídeos é processamento intensivo\n• **RAM:** Cada player mantém buffers de vídeo em memória\n• **GPU:** Renderização de vídeos pode usar aceleração por hardware',
            },
            {
                section: 'Otimizações de Rede',
                steps: [
                    {
                        title: 'Reduza a qualidade dos vídeos',
                        description: 'Clique nas configurações (engrenagem) de cada player e selecione 720p ou 480p ao invés de 1080p60fps. A diferença visual em janelas pequenas é mínima.',
                        tip: 'Mantenha seu stream favorito em alta qualidade e reduza os outros.',
                    },
                    {
                        title: 'Use conexão com fio',
                        description: 'WiFi pode ter problemas com múltiplos streams. Se possível, use cabo Ethernet para conexão mais estável.',
                    },
                    {
                        title: 'Limite o número de streams',
                        description: 'Comece com 2-3 streams. Adicione mais gradualmente se sua conexão suportar.',
                        tip: 'Se você tem internet de 50 Mbps ou menos, fique com no máximo 4 streams em 720p.',
                    },
                    {
                        title: 'Feche outros downloads',
                        description: 'Pause downloads, updates e outras atividades que consomem banda durante sua sessão.',
                    },
                ],
            },
            {
                section: 'Otimizações de Hardware',
                steps: [
                    {
                        title: 'Use navegadores modernos',
                        description: 'Chrome e Edge têm melhor suporte a decodificação por hardware. Firefox é bom mas pode ser mais pesado.',
                        tip: 'Certifique-se de usar a versão mais recente do navegador!',
                    },
                    {
                        title: 'Feche abas desnecessárias',
                        description: 'Cada aba consome RAM. Feche tudo que não estiver usando, especialmente sites pesados como redes sociais.',
                    },
                    {
                        title: 'Desative extensões',
                        description: 'Ad blockers e outras extensões podem interferir. Se tiver problemas, tente modo anônimo.',
                    },
                    {
                        title: 'Use layouts inteligentes',
                        description: 'Layouts como Sidebar e Focused renderizam alguns streams em tamanho menor, consumindo menos recursos que Grid.',
                        tip: 'Streams menores na tela = menos pixels para renderizar = melhor performance.',
                    },
                ],
            },
            {
                section: 'Indicadores de Problemas',
                text: '**Buffering constante:** Sua internet não suporta tantos streams. Reduza a quantidade ou qualidade.\n\n**Navegador travando:** CPU/RAM limitados. Feche outras abas e reduza número de streams.\n\n**Áudio cortando:** Sobrecarga de CPU. Reduza qualidade e quantidade de streams.\n\n**Ventilador alto:** Normal com múltiplos vídeos, mas se persistir, reduza streams ou use modo econômico do laptop.',
            },
            {
                section: 'Configurações Recomendadas',
                text: '**Internet 100+ Mbps, PC moderno:**\n• 6-9 streams em 720p\n• Layout Grid ou Focused\n\n**Internet 50-100 Mbps, PC mediano:**\n• 4-6 streams em 720p/480p mix\n• Layout Sidebar ou Focused\n\n**Internet \u003c50 Mbps ou PC antigo:**\n• 2-4 streams em 480p ou 360p\n• Layout Sidebar com stream principal em qualidade maior\n\n**Mobile/Tablet:**\n• Máximo 2-3 streams em 480p\n• Layout Single ou PiP',
            },
            {
                section: 'Dicas Avançadas',
                text: '• Ative aceleração por hardware nas configurações do navegador (chrome://settings → Sistema).\n\n• Use monitor secundário em resolução menor para diminuir carga de renderização.\n\n• Considere Tab Suspender para pausar automaticamente streams que não estão visíveis.\n\n• Em PCs potentes, driver de GPU atualizado faz diferença significativa.',
            },
        ],
    },
};

export async function generateStaticParams() {
    return Object.keys(guides).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const guide = guides[slug];

    if (!guide) {
        return {
            title: 'Guia não encontrado',
        };
    }

    return {
        title: `${guide.title} - Entrega Newba`,
        description: guide.description,
    };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const guide = guides[slug];

    if (!guide) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link
                    href="/guides"
                    className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Guias
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
                    <p className="text-xl text-[hsl(var(--muted-foreground))]">
                        {guide.description}
                    </p>
                </div>

                <div className="prose prose-invert max-w-none">
                    {guide.content.map((section, index) => (
                        <section key={index} className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))] flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-[hsl(217_91%_60%)] rounded-full" />
                                {section.section}
                            </h2>

                            {section.text && (
                                <div className="text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-line mb-6">
                                    {section.text}
                                </div>
                            )}

                            {section.steps && (
                                <div className="space-y-6">
                                    {section.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="glass-card p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-[hsl(217_91%_60%)] flex items-center justify-center flex-shrink-0 mt-1">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
                                                        {step.description}
                                                    </p>
                                                    {step.tip && (
                                                        <div className="mt-3 p-3 rounded-lg bg-[hsl(217_91%_60%)]/10 border border-[hsl(217_91%_60%)]/20">
                                                            <p className="text-sm text-[hsl(217_91%_60%)] font-medium">
                                                                💡 Dica: {step.tip}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                <section className="mt-16 glass-card p-8">
                    <h2 className="text-2xl font-bold mb-4">Este guia foi útil?</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Confira outros guias ou visite nossa FAQ para mais informações.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                        <Link
                            href="/guides"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[hsl(217_91%_60%)] text-white font-medium hover:bg-[hsl(217_91%_55%)] transition-colors"
                        >
                            Ver Todos os Guias
                        </Link>
                        <Link
                            href="/faq"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--surface-elevated))] transition-colors"
                        >
                            Ver FAQ
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
