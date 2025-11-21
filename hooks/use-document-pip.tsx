import { useState, useCallback, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface UseDocumentPiPProps {
    width?: number;
    height?: number;
}

interface PiPWindowProps {
    children: ReactNode;
}

export function useDocumentPiP({ width = 800, height = 600 }: UseDocumentPiPProps = {}) {
    const [pipWindow, setPipWindow] = useState<Window | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if the API is supported
        if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
            setIsSupported(true);
        }
    }, []);

    const closePiP = useCallback(() => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
        }
    }, [pipWindow]);

    const requestPiP = useCallback(async () => {
        if (!isSupported) return;

        // If already open, close it (toggle behavior)
        if (pipWindow) {
            closePiP();
            return;
        }

        try {
            // @ts-ignore - Types might not be available yet for this new API
            const pip = await window.documentPictureInPicture.requestWindow({
                width,
                height,
            });

            // Copy stylesheets from main window to PiP window
            // This is crucial for Tailwind and other styles to work
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules]
                        .map((rule) => rule.cssText)
                        .join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pip.document.head.appendChild(style);
                } catch (e) {
                    // Might fail for cross-origin stylesheets (e.g. fonts), link them instead
                    if (styleSheet.href) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = styleSheet.href;
                        pip.document.head.appendChild(link);
                    }
                }
            });

            // Also copy any style tags that might be in head (e.g. from Next.js or styled-components)
            const styleTags = document.head.querySelectorAll('style');
            styleTags.forEach(tag => {
                pip.document.head.appendChild(tag.cloneNode(true));
            });

            // Set title
            pip.document.title = "Entrega Newba - Multistream";

            // Copy favicon
            const favicons = document.head.querySelectorAll('link[rel*="icon"]');
            favicons.forEach(icon => {
                pip.document.head.appendChild(icon.cloneNode(true));
            });

            // Listen for close event
            pip.addEventListener('pagehide', () => {
                setPipWindow(null);
            });

            setPipWindow(pip);
        } catch (error) {
            console.error('Failed to open PiP window:', error);
        }
    }, [width, height, isSupported, pipWindow, closePiP]);

    const PiPWindow = ({ children }: PiPWindowProps) => {
        if (!pipWindow) return null;
        return createPortal(children, pipWindow.document.body);
    };

    return {
        isSupported,
        isOpen: !!pipWindow,
        requestPiP,
        closePiP,
        PiPWindow,
    };
}
