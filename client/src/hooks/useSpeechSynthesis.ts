import { useRef, useCallback, useEffect } from 'react';

/**
 * Speaks text using the browser's Speech Synthesis API.
 * Returns a function that speaks and resolves when done (or rejects if unsupported).
 */
export function useSpeechSynthesis(enabled = true) {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const cancel = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    const speak = useCallback(
        (text: string): Promise<void> => {
            if (!enabled || !text?.trim()) return Promise.resolve();
            return new Promise((resolve, reject) => {
                if (typeof window === 'undefined' || !window.speechSynthesis) {
                    resolve();
                    return;
                }
                cancel();
                const s = window.speechSynthesis;
                const u = new SpeechSynthesisUtterance(text.trim());
                u.rate = 0.95;
                u.pitch = 1;
                u.volume = 1;
                const voices = s.getVoices();
                const en = voices.find((v) => v.lang.startsWith('en'));
                if (en) u.voice = en;
                let settled = false;
                const done = () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(tid);
                    resolve();
                };
                const tid = setTimeout(done, 60000);
                u.onend = done;
                u.onerror = done;
                utteranceRef.current = u;
                synthRef.current = s;
                s.speak(u);
            });
        },
        [enabled, cancel]
    );

    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return { speak, cancel };
}
