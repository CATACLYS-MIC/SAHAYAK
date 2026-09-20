import React, { useState, useRef, useEffect } from 'react';
import { Globe, Languages, Check, ChevronDown, Settings, X } from 'lucide-react';
import { useTranslation, Language, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'compact' | 'settings_button';
  className?: string;
}

export function LanguageSelector({ variant = 'header', className }: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageOption, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (variant === 'settings_button') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs",
            className
          )}
          title="Language Settings / भाषा सेटिङ"
        >
          <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{currentLanguageOption.nativeName}</span>
          <Settings className="h-3 w-3 text-slate-400 ml-1" />
        </button>

        {showSettingsModal && (
          <LanguageSettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800", className)}>
        <div className="flex items-center justify-between mb-2 px-1 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            Language / भाषा
          </span>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            title="Open Detailed Language Settings"
          >
            <Settings className="h-2.5 w-2.5" />
            Settings
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "px-2 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all",
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold shadow-xs border border-blue-200 dark:border-blue-900/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.nativeName}</span>
                </span>
                {isSelected && <Check className="h-3 w-3 shrink-0 text-blue-600" />}
              </button>
            );
          })}
        </div>

        {showSettingsModal && (
          <LanguageSettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </div>
    );
  }

  // Header dropdown variant
  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border shadow-xs",
          isOpen
            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
        )}
        title="Change Language / भाषा परिवर्तन गर्नुहोस्"
        aria-label="Change Language"
      >
        <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-sm">{currentLanguageOption.flag}</span>
        <span className="font-semibold">{currentLanguageOption.nativeName}</span>
        <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              भाषा चयन / Choose Language
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowSettingsModal(true);
              }}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Settings
            </button>
          </div>

          <div className="p-1 space-y-0.5 max-h-[320px] overflow-y-auto">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "w-full px-3 py-2 text-left rounded-lg text-xs flex items-center justify-between transition-colors",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {lang.name} • {lang.region}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {lang.code}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-center text-[11px] text-slate-500">
            Selected language applies across the entire SAHAYAK portal.
          </div>
        </div>
      )}

      {showSettingsModal && (
        <LanguageSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

// Detailed Language Settings Modal
interface LanguageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LanguageSettingsModal({ isOpen, onClose }: LanguageSettingsModalProps) {
  const { language, setLanguage, languages, t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {t('nav.select_language', 'Language Settings / भाषा सेटिङ')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('common.info', 'Select any available language. All pages, alerts, and data update instantly.')}
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
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between",
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/30"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({lang.name})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {lang.region} • {lang.code.toUpperCase()}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded-full">
                    <Check className="h-3.5 w-3.5" />
                    <span>Active</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage(lang.code);
                    }}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Select
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>Global multi-language synchronization enabled</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            {t('common.close', 'Done / बन्द गर्नुहोस्')}
          </button>
        </div>
      </div>
    </div>
  );
}

