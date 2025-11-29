import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface SidebarHeaderProps {
    isMobile: boolean;
    onClose?: () => void;
}

export function SidebarHeader({ isMobile, onClose }: SidebarHeaderProps) {
    return (
        <div className="flex items-center gap-3 animate-scale-in">
            <Link href="/" className="w-10 h-10 rounded-xl overflow-hidden shadow-lg relative hover:opacity-80 transition-opacity">
                <Image
                    src="/android-chrome-192x192.png"
                    alt="Entrega Newba"
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                />
            </Link>
            <div className="flex-1">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Entrega Newba</h1>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Watch smarter, not harder</p>
                </Link>
            </div>

            {/* Close button - Mobile only */}
            {isMobile && onClose && (
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--border-strong))] transition-all"
                    title="Fechar sidebar"
                >
                    <ChevronLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </button>
            )}
        </div>
    );
}
