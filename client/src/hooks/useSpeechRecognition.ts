import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const finalTranscriptRef = useRef('');

    const stopListening = useCallback(() => {
        const rec = recognitionRef.current;
        if (rec) {
            try {
                rec.abort();
            } catch (_) {}
            recognitionRef.current = null;
            setIsListening(false);
            setInterimTranscript('');
        }
    }, []);

    const startListening = useCallback((): Promise<string> => {
        return new Promise((resolve) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setError('Speech recognition is not supported in this browser. Try Chrome.');
                resolve('');
                return;
            }
            setError(null);
            finalTranscriptRef.current = '';
            setInterimTranscript('');
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            recognitionRef.current = rec;
            setIsListening(true);

            rec.onresult = (e: SpeechRecognitionEvent) => {
                let interim = '';
                let final = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const transcript = e.results[i][0].transcript;
                    if (e.results[i].isFinal) {
                        final += transcript;
                    } else {
                        interim += transcript;
                    }
                }
                if (final) finalTranscriptRef.current += final;
                setInterimTranscript(interim);
            };

            rec.onerror = (e: SpeechRecognitionErrorEvent) => {
                if (e.error === 'aborted' || e.error === 'no-speech') return;
                setError(e.error || 'Recognition error');
            };

            rec.onend = () => {
                recognitionRef.current = null;
                setIsListening(false);
                setInterimTranscript('');
                resolve(finalTranscriptRef.current.trim());
            };

            try {
                rec.start();
            } catch (err) {
                setIsListening(false);
                setError('Could not start microphone');
                resolve('');
            }
        });
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (_) {}
            }
        };
    }, []);

    return { startListening, stopListening, isListening, interimTranscript, error, isSupported: typeof (window.SpeechRecognition || (window as any).webkitSpeechRecognition) !== 'undefined' };
}
