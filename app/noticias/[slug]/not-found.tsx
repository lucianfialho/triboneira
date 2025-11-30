import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsNotFound() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="w-24 h-24 mx-auto mb-6 text-[hsl(var(--muted-foreground))] opacity-50" />

        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
          Notícia não encontrada
        </h1>

        <p className="text-[hsl(var(--muted-foreground))] mb-8">
          A notícia que você está procurando não existe ou foi removida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/noticias">
            <Button variant="default" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para notícias
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Ir para home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
