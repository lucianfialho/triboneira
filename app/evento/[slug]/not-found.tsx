import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Página 404 personalizada para eventos não encontrados
 * Exibida quando o slug não existe no banco
 */
export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        {/* Código de erro */}
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-[hsl(var(--foreground))]">
            404
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/50] mx-auto rounded-full" />
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Evento não encontrado
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            O evento que você procura não existe ou foi removido.
            <br />
            Verifique o link ou explore outros eventos ao vivo.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 pt-4">
          <Link href="/">
            <Button className="w-full gradient-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Button>
          </Link>

          <Link href="/noticias">
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Notícias
            </Button>
          </Link>
        </div>

        {/* Dica */}
        <p className="text-xs text-[hsl(var(--muted-foreground))] pt-4">
          Procurando um evento específico? Confira a home para ver os eventos ao vivo agora.
        </p>
      </div>
    </div>
  );
}
