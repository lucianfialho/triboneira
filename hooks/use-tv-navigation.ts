'use client';

import { useEffect } from 'react';

/**
 * Custom hook for TV/D-pad navigation support
 * Handles keyboard navigation (arrow keys, Enter, Back) for TV remote controls
 */
export function useTVNavigation() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Get all focusable elements
            const focusableElements = document.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            const focusableArray = Array.from(focusableElements) as HTMLElement[];
            const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    // Focus next element
                    if (currentIndex < focusableArray.length - 1) {
                        focusableArray[currentIndex + 1]?.focus();
                    }
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    // Focus previous element
                    if (currentIndex > 0) {
                        focusableArray[currentIndex - 1]?.focus();
                    }
                    break;

                case 'ArrowRight':
                    // Allow default behavior for horizontal scrolling
                    // But can be customized if needed
                    break;

                case 'ArrowLeft':
                    // Allow default behavior for horizontal scrolling
                    break;

                case 'Enter':
                    // Click the focused element
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.click();
                    }
                    break;

                case 'Escape':
                case 'Backspace':
                    e.preventDefault();
                    // Navigate back or close modals
                    // This can be customized based on app state
                    break;
            }
        };

        // Add keyboard event listener
        document.addEventListener('keydown', handleKeyDown);

        // Add TV-specific class to body for styling
        if (isTVDevice()) {
            document.body.classList.add('tv-mode');
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}

/**
 * Detect if the current device is a TV
 */
export function isTVDevice(): boolean {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent.toLowerCase();
    const isTVUserAgent = /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast|nettv|web0s|webos|opera tv|salora|roku|viera|aquos|bravia|mitv|tv|television/i.test(ua);

    // Also check for large screen and landscape orientation
    const isLargeScreen = window.innerWidth >= 1920 && window.innerHeight >= 1080;
    const isLandscape = window.innerWidth > window.innerHeight;

    return isTVUserAgent || (isLargeScreen && isLandscape);
}
