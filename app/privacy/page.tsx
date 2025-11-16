import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade - Entrega Newba',
  description: 'Política de Privacidade do Entrega Newba - Como coletamos, usamos e protegemos suas informações.',
};

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[hsl(var(--muted-foreground))] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">1. Introdução</h2>
            <p>
              O Entrega Newba ("nós", "nosso" ou "nos") respeita sua privacidade e está comprometido em proteger
              suas informações pessoais. Esta Política de Privacidade explica como coletamos, usamos e compartilhamos
              informações quando você usa nosso site entreganewba.com.br (o "Serviço").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">2. Informações que Coletamos</h2>

            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">2.1. Informações de Uso</h3>
            <p className="mb-4">
              Coletamos automaticamente certas informações quando você visita nosso Serviço, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Endereço IP</li>
              <li>Tipo de navegador e versão</li>
              <li>Páginas visitadas</li>
              <li>Tempo gasto em páginas</li>
              <li>Fonte de referência</li>
              <li>Interações com o Serviço (streams adicionados, layouts selecionados, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">2.2. Cookies e Tecnologias Similares</h3>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Cookies de preferências (layout, tema, etc.)</li>
              <li>Cookies de analytics (Google Analytics, Amplitude)</li>
              <li>Cookies de publicidade (Google AdSense)</li>
            </ul>

            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">2.3. Informações de Terceiros</h3>
            <p>
              Quando você adiciona streams de plataformas como Twitch, YouTube ou Kick, podemos receber
              informações públicas dessas plataformas através de suas APIs públicas, como nome de usuário,
              status de transmissão e número de espectadores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">3. Como Usamos suas Informações</h2>
            <p className="mb-4">Usamos as informações coletadas para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecer, manter e melhorar nosso Serviço</li>
              <li>Personalizar sua experiência</li>
              <li>Analisar como o Serviço é usado</li>
              <li>Desenvolver novos recursos e funcionalidades</li>
              <li>Exibir anúncios relevantes (Google AdSense)</li>
              <li>Detectar e prevenir fraudes ou abusos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">4. Compartilhamento de Informações</h2>
            <p className="mb-4">Podemos compartilhar suas informações com:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-[hsl(var(--foreground))]">Provedores de Serviço:</strong> Google Analytics, Amplitude, Google AdSense</li>
              <li><strong className="text-[hsl(var(--foreground))]">APIs de Terceiros:</strong> Twitch, YouTube, Kick (apenas dados públicos)</li>
              <li><strong className="text-[hsl(var(--foreground))]">Cumprimento Legal:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
            </ul>
            <p className="mt-4">
              Não vendemos suas informações pessoais a terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">5. Google AdSense</h2>
            <p>
              Usamos o Google AdSense para exibir anúncios em nosso Serviço. O Google pode usar cookies para
              exibir anúncios com base em suas visitas anteriores ao nosso site e a outros sites na Internet.
              Você pode desativar anúncios personalizados visitando as{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(217_91%_60%)] hover:underline"
              >
                Configurações de anúncios do Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Confirmar se tratamos seus dados pessoais</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
              <li>Revogar seu consentimento</li>
              <li>Obter informações sobre compartilhamento de dados</li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato através de:{' '}
              <a href="mailto:privacidade@entreganewba.com.br" className="text-[hsl(217_91%_60%)] hover:underline">
                privacidade@entreganewba.com.br
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">7. Segurança</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas
              informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto,
              nenhum método de transmissão pela Internet é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">8. Crianças</h2>
            <p>
              Nosso Serviço não é direcionado a menores de 13 anos. Não coletamos intencionalmente informações
              pessoais de crianças. Se você é pai ou responsável e acredita que seu filho nos forneceu informações
              pessoais, entre em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">9. Alterações nesta Política</h2>
            <p>
              Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre
              quaisquer alterações publicando a nova Política nesta página e atualizando a data de
              "Última atualização" no topo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">10. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
            </p>
            <ul className="list-none space-y-2 mt-2">
              <li>Email: <a href="mailto:privacidade@entreganewba.com.br" className="text-[hsl(217_91%_60%)] hover:underline">privacidade@entreganewba.com.br</a></li>
              <li>Website: <a href="https://entreganewba.com.br" className="text-[hsl(217_91%_60%)] hover:underline">entreganewba.com.br</a></li>
            </ul>
          </section>

          <section className="pt-8 border-t border-[hsl(var(--border))]">
            <div className="flex gap-4">
              <Link
                href="/about"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Sobre
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
