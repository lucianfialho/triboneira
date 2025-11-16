import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso - Entrega Newba',
  description: 'Termos de Uso do Entrega Newba - Regras e condições para utilizar nosso serviço.',
};

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Termos de Uso</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-8 text-[hsl(var(--muted-foreground))] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Entrega Newba ("Serviço"), disponível em entreganewba.com.br, você concorda
              em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte
              destes termos, não use o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">2. Descrição do Serviço</h2>
            <p>
              O Entrega Newba é uma plataforma web que permite aos usuários assistir múltiplas transmissões
              ao vivo simultaneamente de diferentes plataformas de streaming, incluindo, mas não se limitando
              a Twitch, YouTube e Kick. O Serviço é fornecido gratuitamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">3. Uso Aceitável</h2>
            <p className="mb-4">Você concorda em usar o Serviço apenas para fins legais e de acordo com estes Termos. Você concorda em NÃO:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Usar o Serviço de qualquer forma que viole leis ou regulamentos aplicáveis</li>
              <li>Tentar interferir, comprometer ou interromper o Serviço</li>
              <li>Usar automação, scripts ou bots para acessar o Serviço</li>
              <li>Contornar medidas de segurança ou controles de acesso</li>
              <li>Fazer engenharia reversa ou descompilar qualquer parte do Serviço</li>
              <li>Usar o Serviço para transmitir spam, malware ou conteúdo malicioso</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Coletar informações de outros usuários sem consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">4. Conteúdo de Terceiros</h2>
            <p>
              O Serviço exibe conteúdo de plataformas de terceiros (Twitch, YouTube, Kick). Não somos
              responsáveis pelo conteúdo exibido nessas plataformas. Todo o conteúdo está sujeito aos
              termos e políticas das respectivas plataformas. Não hospedamos, armazenamos ou transmitimos
              qualquer conteúdo de vídeo - apenas incorporamos players públicos dessas plataformas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">5. Propriedade Intelectual</h2>
            <p>
              O Serviço e seu conteúdo original (excluindo conteúdo de terceiros), recursos e funcionalidades
              são de propriedade do Entrega Newba e estão protegidos por direitos autorais, marcas registradas
              e outras leis de propriedade intelectual.
            </p>
            <p className="mt-4">
              As marcas Twitch, YouTube e Kick são propriedade de seus respectivos donos. Não reivindicamos
              nenhuma afiliação com essas plataformas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">6. Publicidade</h2>
            <p>
              O Serviço pode exibir anúncios fornecidos por terceiros, incluindo Google AdSense. Ao usar
              o Serviço, você concorda com a exibição desses anúncios. A interação com anúncios está
              sujeita às políticas dos anunciantes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">7. Isenção de Garantias</h2>
            <p className="mb-4">
              O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER TIPO,
              EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Garantias de comercialização</li>
              <li>Adequação a uma finalidade específica</li>
              <li>Não violação de direitos</li>
              <li>Disponibilidade ininterrupta ou livre de erros</li>
              <li>Precisão ou confiabilidade do conteúdo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">8. Limitação de Responsabilidade</h2>
            <p>
              EM NENHUMA CIRCUNSTÂNCIA O ENTREGA NEWBA, SEUS DIRETORES, FUNCIONÁRIOS OU PARCEIROS SERÃO
              RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS,
              INCLUINDO, SEM LIMITAÇÃO, PERDA DE LUCROS, DADOS, USO OU OUTROS PREJUÍZOS INTANGÍVEIS,
              RESULTANTES DE:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Uso ou incapacidade de usar o Serviço</li>
              <li>Acesso não autorizado ou alteração de suas transmissões ou dados</li>
              <li>Declarações ou condutas de terceiros no Serviço</li>
              <li>Qualquer outro assunto relacionado ao Serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">9. Links para Sites de Terceiros</h2>
            <p>
              O Serviço pode conter links para sites ou serviços de terceiros que não são de propriedade
              ou controlados pelo Entrega Newba. Não temos controle sobre, e não assumimos responsabilidade
              pelo conteúdo, políticas de privacidade ou práticas de sites ou serviços de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">10. Modificações do Serviço</h2>
            <p>
              Reservamos o direito de modificar ou descontinuar, temporária ou permanentemente, o Serviço
              (ou qualquer parte dele) com ou sem aviso prévio. Não seremos responsáveis perante você ou
              terceiros por qualquer modificação, suspensão ou descontinuação do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">11. Alterações nos Termos</h2>
            <p>
              Podemos revisar estes Termos de Uso periodicamente. A versão mais atual sempre estará
              disponível nesta página. Seu uso continuado do Serviço após quaisquer alterações constitui
              sua aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">12. Lei Aplicável</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar
              suas disposições sobre conflitos de leis. Qualquer disputa relacionada a estes Termos será
              submetida à jurisdição exclusiva dos tribunais brasileiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">13. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato:
            </p>
            <ul className="list-none space-y-2 mt-2">
              <li>Email: <a href="mailto:contato@entreganewba.com.br" className="text-[hsl(217_91%_60%)] hover:underline">contato@entreganewba.com.br</a></li>
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
                href="/privacy"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Política de Privacidade
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
