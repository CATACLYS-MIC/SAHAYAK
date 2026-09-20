import React, { useState, useRef, useEffect } from 'react';
import { Globe, Languages, Check, ChevronDown } from 'lucide-react';
import { useTranslation, Language, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'header', className }: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageOption, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  if (variant === 'sidebar') {
    return (
      <div className={cn("p-2 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800", className)}>
        <div className="flex items-center justify-between mb-1.5 px-1 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            Language / भाषा
          </span>
          <span className="text-slate-400 font-mono text-[10px]">{currentLanguageOption.code.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
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
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              भाषा चयन / Choose Language
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase">
              {languages.length} options
            </span>
          </div>

          <div className="p-1 space-y-0.5">
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
    </div>
  );
}
