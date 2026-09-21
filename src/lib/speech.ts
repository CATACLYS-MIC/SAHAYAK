import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from './i18n';

/**
 * Multi-language configuration matrix for Web Speech API
 * Covers Nepali, English, Nepal Bhasa (Newari), Maithili, and Hindi.
 */
export interface LanguageSpeechProfile {
  code: Language;
  name: string;
  nativeName: string;
  primaryRecognitionTag: string;
  recognitionFallbacks: string[];
  ttsLocaleTags: string[];
  voiceNameKeywords: string[];
  samplePhrase: string;
  voiceDescription: string;
}

export const LANGUAGE_SPEECH_PROFILES: Record<Language, LanguageSpeechProfile> = {
  ne: {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    primaryRecognitionTag: 'ne-NP',
    recognitionFallbacks: ['ne', 'hi-IN'],
    ttsLocaleTags: ['ne-NP', 'ne', 'hi-IN', 'hi'],
    voiceNameKeywords: ['nepali', 'nepal', 'ne-np', 'hindi', 'lekh', 'kalpana', 'google हिन्दी'],
    samplePhrase: 'नमस्कार! म सहयाक विपद् सहायक हुँ। म तपाईंलाई विपद् सुरक्षा र सडक अवस्थाबारे जानकारी दिन सक्छु।',
    voiceDescription: 'Nepali (नेपाली) - Devanagari Voice'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    primaryRecognitionTag: 'en-US',
    recognitionFallbacks: ['en-GB', 'en-IN', 'en'],
    ttsLocaleTags: ['en-US', 'en-GB', 'en-IN', 'en'],
    voiceNameKeywords: ['english', 'google us', 'samantha', 'daniel', 'karen', 'george', 'zira'],
    samplePhrase: 'Hello! I am SAHAYAK Disaster Assistant. I can help with real-time flood, landslide, and shelter intelligence.',
    voiceDescription: 'English - Global / South Asian Accent'
  },
  new: {
    code: 'new',
    name: 'Nepal Bhasa',
    nativeName: 'नेपाल भाषा',
    primaryRecognitionTag: 'new-NP',
    recognitionFallbacks: ['new', 'ne-NP', 'hi-IN'],
    ttsLocaleTags: ['new-NP', 'new', 'ne-NP', 'ne', 'hi-IN'],
    voiceNameKeywords: ['newari', 'nepali', 'nepal', 'hindi', 'lekh'],
    samplePhrase: 'ज्वजलपा! जि सहयाक विपद् सहायक खः। जिं छितः बाढी, चलः व सुरक्षाया जानकारी बीफु।',
    voiceDescription: 'Nepal Bhasa (Newari) - Kathmandu Valley Acoustic Model'
  },
  mai: {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    primaryRecognitionTag: 'mai-NP',
    recognitionFallbacks: ['mai-IN', 'mai', 'hi-IN', 'ne-NP'],
    ttsLocaleTags: ['mai-NP', 'mai-IN', 'mai', 'hi-IN', 'hi', 'ne-NP'],
    voiceNameKeywords: ['maithili', 'bihari', 'hindi', 'nepali', 'google हिन्दी'],
    samplePhrase: 'प्रणाम! हम सहयाक आपदा सहायक छी। अहाँ बाढि, सडक आ आश्रयस्थल केर जानकारी लऽ सकैत छी।',
    voiceDescription: 'Maithili (मैथिली) - Mithila / Terai Regional Model'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    primaryRecognitionTag: 'hi-IN',
    recognitionFallbacks: ['hi', 'ne-NP'],
    ttsLocaleTags: ['hi-IN', 'hi', 'ne-NP'],
    voiceNameKeywords: ['hindi', 'india', 'google हिन्दी', 'lekha', 'kalpana', 'swara'],
    samplePhrase: 'नमस्ते! मैं सहायक आपदा मित्र हूँ। मैं आपको बाढ़, भूस्खलन और सुरक्षित आश्रयों की सटीक जानकारी दे सकता हूँ।',
    voiceDescription: 'Hindi (हिन्दी) - South Asian Devanagari Voice'
  }
};

/**
 * Checks browser support for Web Speech API
 */
export function checkWebSpeechSupport(): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
} {
  const hasRecognition = typeof window !== 'undefined' && 
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const hasSynthesis = typeof window !== 'undefined' && 
    Boolean(window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined');

  return {
    speechRecognition: hasRecognition,
    speechSynthesis: hasSynthesis
  };
}

/**
 * Sanitizes markdown, emojis, URLs, and asterisks for smooth, natural TTS output
 */
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Strip markdown headers
    .replace(/^#+\s+/gm, '')
    // Strip URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Strip markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip bold/italics asterisks and underscores
    .replace(/[*_~`]/g, '')
    // Strip markdown table borders & dividers
    .replace(/\|/g, ' ')
    // Strip bullet markers (- or *)
    .replace(/^[-*+]\s+/gm, '')
    // Strip numbered list markers
    .replace(/^\d+\.\s+/gm, '')
    // Strip emoji pictographs that cause synthesizer stutter
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Clean excessive spaces and newlines
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Retrieves all currently available SpeechSynthesis voices, handling async loading in Chrome
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const immediateVoices = window.speechSynthesis.getVoices();
    if (immediateVoices && immediateVoices.length > 0) {
      resolve(immediateVoices);
      return;
    }

    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(voices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Timeout safety fallback after 600ms
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 600);
  });
}

/**
 * Finds the best matching voice for a given language from the list of browser voices
 */
export function findBestVoice(
  lang: Language,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const profile = LANGUAGE_SPEECH_PROFILES[lang] || LANGUAGE_SPEECH_PROFILES.ne;
  const targetLocales = profile.ttsLocaleTags.map(t => t.toLowerCase().replace('_', '-'));
  const keywords = profile.voiceNameKeywords.map(k => k.toLowerCase());

  // 1. Exact locale match (e.g. 'ne-NP', 'hi-IN', 'en-US')
  for (const target of targetLocales) {
    const exactMatch = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-') === target);
    if (exactMatch) return exactMatch;
  }

  // 2. Language prefix match (e.g. 'ne', 'hi', 'en')
  for (const target of targetLocales) {
    const langPrefix = target.split('-')[0];
    const prefixMatch = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;
  }

  // 3. Name keyword match (e.g. voice containing "Hindi", "Nepali", "Google हिन्दी")
  for (const keyword of keywords) {
    const nameMatch = voices.find(v => v.name && v.name.toLowerCase().includes(keyword));
    if (nameMatch) return nameMatch;
  }

  // 4. Default system voice
  const defaultVoice = voices.find(v => v.default);
  if (defaultVoice) return defaultVoice;

  return voices[0] || null;
}

export interface UseWebSpeechOptions {
  onAutoSubmit?: (transcript: string) => void;
  defaultAutoSpeak?: boolean;
}

/**
 * Comprehensive React hook for Web Speech API (Speech Recognition + Speech Synthesis)
 * Works seamlessly across all 5 supported languages: Nepali, English, Nepal Bhasa, Maithili, Hindi
 */
export function useWebSpeech(currentLanguage: Language, options: UseWebSpeechOptions = {}) {
  const { onAutoSubmit, defaultAutoSpeak = false } = options;

  // Support check
  const [support, setSupport] = useState(() => checkWebSpeechSupport());

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Voices and settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem('sahayak_tts_rate');
    return saved ? Number(saved) : 1.0;
  });
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahayak_tts_autospeak');
    return saved !== null ? saved === 'true' : defaultAutoSpeak;
  });
  const [autoSendOnSilence, setAutoSendOnSilence] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahayak_stt_autosend');
    return saved !== null ? saved === 'true' : true;
  });
  const [currentlySpokenText, setCurrentlySpokenText] = useState<string | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const recognitionTagIndexRef = useRef<number>(0);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoSendTimerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Save settings to localStorage
  const updateSpeechRate = useCallback((rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('sahayak_tts_rate', String(rate));
  }, []);

  const updateAutoSpeak = useCallback((val: boolean) => {
    setAutoSpeakEnabled(val);
    localStorage.setItem('sahayak_tts_autospeak', String(val));
  }, []);

  const updateAutoSendOnSilence = useCallback((val: boolean) => {
    setAutoSendOnSilence(val);
    localStorage.setItem('sahayak_stt_autosend', String(val));
  }, []);

  // Load voices and update active voice when language or voices change
  useEffect(() => {
    let active = true;

    getAvailableVoices().then((voices) => {
      if (!active) return;
      setAvailableVoices(voices);
      const matchedVoice = findBestVoice(currentLanguage, voices);
      setActiveVoice(matchedVoice);
    });

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        const voices = window.speechSynthesis.getVoices();
        if (active) {
          setAvailableVoices(voices);
          const matchedVoice = findBestVoice(currentLanguage, voices);
          setActiveVoice(matchedVoice);
        }
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        active = false;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [currentLanguage]);

  // Determine speech recognition tags for current language
  const getRecognitionTags = useCallback((lang: Language): string[] => {
    const profile = LANGUAGE_SPEECH_PROFILES[lang] || LANGUAGE_SPEECH_PROFILES.ne;
    return [profile.primaryRecognitionTag, ...profile.recognitionFallbacks];
  }, []);

  // Initialize SpeechRecognition instance
  const initRecognition = useCallback(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSupport(prev => ({ ...prev, speechRecognition: false }));
      return null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const tags = getRecognitionTags(currentLanguage);
      const tagToUse = tags[recognitionTagIndexRef.current] || tags[0] || 'en-US';
      recognition.lang = tagToUse;

      recognition.onstart = () => {
        if (!isComponentMounted.current) return;
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        if (!isComponentMounted.current) return;
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          const trimmed = final.trim();
          setTranscript(trimmed);
          setInterimTranscript('');

          // Auto-send handling on silence
          if (autoSendOnSilence && onAutoSubmit && trimmed) {
            if (autoSendTimerRef.current) {
              clearTimeout(autoSendTimerRef.current);
            }
            autoSendTimerRef.current = setTimeout(() => {
              onAutoSubmit(trimmed);
            }, 900);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (!isComponentMounted.current) return;
        console.warn('Web Speech Recognition error:', event.error);

        // Language tag fallback handling
        if (event.error === 'language-not-supported' || event.error === 'bad-grammar') {
          const tags = getRecognitionTags(currentLanguage);
          if (recognitionTagIndexRef.current < tags.length - 1) {
            recognitionTagIndexRef.current += 1;
            console.info(`Retrying speech recognition with fallback tag: ${tags[recognitionTagIndexRef.current]}`);
            try {
              recognition.stop();
              setTimeout(() => {
                if (isComponentMounted.current) startListening();
              }, 150);
              return;
            } catch (err) {
              // Ignore
            }
          }
        }

        let userMsg = 'Speech recognition error encountered.';
        if (event.error === 'not-allowed') {
          userMsg = 'Microphone access is blocked. Please allow microphone permission in your browser.';
        } else if (event.error === 'no-speech') {
          userMsg = 'No speech detected. Please speak closer to the microphone.';
        } else if (event.error === 'network') {
          userMsg = 'Network connection required for online speech recognition.';
        } else if (event.error === 'audio-capture') {
          userMsg = 'No microphone detected on your device.';
        }

        setSpeechError(userMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!isComponentMounted.current) return;
        setIsListening(false);
      };

      return recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization failed:', err);
      setSpeechError('Could not initialize speech recognition.');
      return null;
    }
  }, [currentLanguage, getRecognitionTags, autoSendOnSilence, onAutoSubmit]);

  // Start listening
  const startListening = useCallback(() => {
    // Clear previous errors and transcripts
    setSpeechError(null);
    setTranscript('');
    setInterimTranscript('');

    // Stop speaking if currently speaking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpokenText(null);
    }

    // Abort existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }

    const rec = initRecognition();
    if (!rec) return;

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err: any) {
      console.warn('recognition.start error:', err);
      if (err?.name === 'InvalidStateError') {
        // Already active
        setIsListening(true);
      } else {
        setSpeechError('Failed to start microphone. Please check permissions.');
      }
    }
  }, [initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text using SpeechSynthesis
  const speak = useCallback((textToSpeak: string, onDone?: () => void) => {
    if (!support.speechSynthesis || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    const sanitized = sanitizeTextForSpeech(textToSpeak);
    if (!sanitized) return;

    // Cap at reasonable length to prevent hanging on huge messages
    const textChunk = sanitized.slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(textChunk);
    const profile = LANGUAGE_SPEECH_PROFILES[currentLanguage] || LANGUAGE_SPEECH_PROFILES.ne;

    // Apply matched voice or target locale
    if (activeVoice) {
      utterance.voice = activeVoice;
      utterance.lang = activeVoice.lang || profile.ttsLocaleTags[0];
    } else {
      utterance.lang = profile.ttsLocaleTags[0];
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (!isComponentMounted.current) return;
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentlySpokenText(textToSpeak);
    };

    utterance.onend = () => {
      if (!isComponentMounted.current) return;
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpokenText(null);
      if (onDone) onDone();
    };

    utterance.onerror = (e: any) => {
      if (!isComponentMounted.current) return;
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpokenText(null);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [support.speechSynthesis, currentLanguage, activeVoice, speechRate]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentlySpokenText(null);
  }, []);

  // Pause speaking
  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  // Resume speaking
  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Voice sample tester
  const testVoiceSample = useCallback((langToTest?: Language) => {
    const lang = langToTest || currentLanguage;
    const profile = LANGUAGE_SPEECH_PROFILES[lang] || LANGUAGE_SPEECH_PROFILES.ne;
    speak(profile.samplePhrase);
  }, [currentLanguage, speak]);

  // Clear speech errors
  const clearError = useCallback(() => {
    setSpeechError(null);
  }, []);

  // Cleanup on unmount or language switch
  useEffect(() => {
    recognitionTagIndexRef.current = 0;
    return () => {
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentLanguage]);

  return {
    support,
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    interimTranscript,
    speechError,
    availableVoices,
    activeVoice,
    activeProfile: LANGUAGE_SPEECH_PROFILES[currentLanguage] || LANGUAGE_SPEECH_PROFILES.ne,
    speechRate,
    autoSpeakEnabled,
    autoSendOnSilence,
    currentlySpokenText,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    testVoiceSample,
    setSpeechRate: updateSpeechRate,
    setAutoSpeakEnabled: updateAutoSpeak,
    setAutoSendOnSilence: updateAutoSendOnSilence,
    setActiveVoice,
    clearError
  };
}
