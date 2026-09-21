import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Building2, Home } from 'lucide-react';

export function MapRouteLegend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-xs select-none">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs overflow-hidden transition-all duration-200">
        
        {/* Toggle header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider">Map Color Codes & Routes</span>
          </div>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Legend contents */}
        {isOpen && (
          <div className="p-3 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            
            {/* Active Navigation Routes */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Disaster Navigation Paths
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1.5 rounded-full bg-emerald-500 shadow-xs"></div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Recommended Safest Route
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-auto">Bypass</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1.5 rounded-full bg-red-500 border border-dashed border-red-700"></div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    Route to Avoid (Blocked)
                  </span>
                  <span className="text-[10px] text-red-600 font-bold ml-auto">Danger</span>
                </div>
              </div>
            </div>

            {/* Roads & Bridges Color Codes */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Roads & Bridges Status
              </span>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Green:</strong> Totally normal roads & bridges
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Yellow:</strong> Restricted & risky bridges / caution
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Red:</strong> Blocked roads & damaged bridges
                  </span>
                </div>
              </div>
            </div>

            {/* Facilities Pins */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span>🏥</span>
                <span>Hospitals (Live Beds)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏠</span>
                <span>Relief Shelters</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
