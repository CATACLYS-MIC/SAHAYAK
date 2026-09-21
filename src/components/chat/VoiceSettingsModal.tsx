import React from 'react';
import { 
  Volume2, 
  Settings, 
  Check, 
  Play, 
  Square, 
  Mic, 
  Languages, 
  X, 
  Sliders, 
  Info,
  Radio
} from 'lucide-react';
import { Language } from '../../lib/i18n';
import { 
  LANGUAGE_SPEECH_PROFILES, 
  LanguageSpeechProfile 
} from '../../lib/speech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (enabled: boolean) => void;
  autoSend: boolean;
  onAutoSendChange: (enabled: boolean) => void;
  availableVoices: SpeechSynthesisVoice[];
  activeVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice | null) => void;
  isSpeaking: boolean;
  onTestVoice: () => void;
  onStopSpeaking: () => void;
}

export function VoiceSettingsModal({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  speechRate,
  onSpeechRateChange,
  autoSpeak,
  onAutoSpeakChange,
  autoSend,
  onAutoSendChange,
  availableVoices,
  activeVoice,
  onVoiceSelect,
  isSpeaking,
  onTestVoice,
  onStopSpeaking
}: VoiceSettingsModalProps) {
  if (!isOpen) return null;

  const currentProfile: LanguageSpeechProfile = 
    LANGUAGE_SPEECH_PROFILES[language] || LANGUAGE_SPEECH_PROFILES.ne;

  // Filter voices that might be relevant for current language or general
  const filteredVoices = availableVoices.filter(v => {
    const vLang = v.lang.toLowerCase();
    const isMatching = currentProfile.ttsLocaleTags.some(tag => 
      vLang.includes(tag.toLowerCase().split('-')[0])
    );
    return isMatching || v.default;
  });

  const displayVoices = filteredVoices.length > 0 ? filteredVoices : availableVoices.slice(0, 15);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Voice & Speech Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Web Speech API • Multi-Language Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Active Profile Info */}
          <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300 flex items-center space-x-1.5">
                <Radio className="h-3.5 w-3.5 text-red-600 animate-pulse" />
                <span>Active Language Profile</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-red-600 text-white">
                {currentProfile.nativeName} ({currentProfile.primaryRecognitionTag})
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentProfile.voiceDescription}
            </p>
            <div className="pt-2 border-t border-red-200/60 dark:border-red-900/40 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Test Speech Model:</span>
              <div className="flex items-center space-x-2">
                {isSpeaking ? (
                  <button
                    onClick={onStopSpeaking}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={onTestVoice}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Sample Voice</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Assistant Language Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <Languages className="h-3.5 w-3.5" />
              <span>Speech Recognition & Voice Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(LANGUAGE_SPEECH_PROFILES).map((prof) => (
                <button
                  key={prof.code}
                  onClick={() => onLanguageChange(prof.code)}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all ${
                    language === prof.code
                      ? 'border-red-600 bg-red-50/80 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold">{prof.nativeName}</div>
                  <div className="text-[10px] text-slate-400">{prof.primaryRecognitionTag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Speaking Speed Rate
              </label>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {speechRate}x
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[0.8, 0.9, 1.0, 1.1, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSpeechRateChange(rate)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    speechRate === rate
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {rate === 1.0 ? '1.0x (Normal)' : `${rate}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine Selector (if browser provides choices) */}
          {availableVoices.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Text-to-Speech Voice</span>
                <span className="text-[10px] font-normal text-slate-400 lowercase">
                  {availableVoices.length} voices found
                </span>
              </label>
              <select
                value={activeVoice?.voiceURI || ''}
                onChange={(e) => {
                  const selected = availableVoices.find(v => v.voiceURI === e.target.value) || null;
                  onVoiceSelect(selected);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Auto-Detect Optimal Regional Voice</option>
                {displayVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.default ? '★ Default' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Automation Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Auto Read Replies */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Auto-Read AI Responses
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically read aloud new assistant replies
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAutoSpeakChange(!autoSpeak)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSpeak ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoSpeak ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto Send on Silence */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Auto-Submit Speech on Pause
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send query automatically 1 second after you finish speaking
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAutoSendChange(!autoSend)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSend ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoSend ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Compatibility Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Voice-to-text uses the browser's native Web Speech API. For best accuracy in Nepali, Maithili, or Hindi, Chrome, Edge, or Android browsers are recommended.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
