import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Stethoscope, AlertTriangle, CheckCircle2, Search, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface HospitalMatchingNetworkCardProps {
  onOpenPortal?: () => void;
  className?: string;
}

export function HospitalMatchingNetworkCard({ onOpenPortal, className }: HospitalMatchingNetworkCardProps) {
  const { 
    hospitalMatchingStats, 
    hospitalMatches, 
    hospitalPatients,
    hospitalAccessRole 
  } = useAppState();
  const { t, translateDynamic } = useTranslation();

  const pendingMatches = hospitalMatches.filter(m => m.status === 'PENDING_HUMAN_REVIEW');
  const highConfidencePending = pendingMatches.filter(m => m.matchConfidence >= 75);

  return (
    <Card className={cn("overflow-hidden border-slate-200 dark:border-slate-800", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {t('Hospital Missing-Person Matching')}
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                {t('SIMULATED DATA')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Authorized Trauma Hospital Network • Autonomous Multimodal Identification')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Badge variant="outline" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            RBAC Protected
          </Badge>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('Patients Submitted')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {hospitalMatchingStats.patientsSubmitted}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{t('unidentified')}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/50">
          <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            {t('AI Matches Flagged')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-teal-700 dark:text-teal-300">
              {hospitalMatchingStats.aiMatchesFlagged}
            </span>
            <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-medium">{t('candidates')}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            {t('Awaiting Verification')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {hospitalMatchingStats.awaitingVerification}
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">{t('human review')}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            {t('Matches Confirmed')}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {hospitalMatchingStats.potentialMatchesConfirmed}
            </span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">{t('verified safe')}</span>
          </div>
        </div>
      </div>

      {/* ACTIVE DISASTER ALERT BANNER */}
      {highConfidencePending.length > 0 && (
        <div className="p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              {highConfidencePending.length} {t('High-Confidence AI Candidate(s) Require Medical Verification')}
            </p>
            <p className="text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              {translateDynamic('Unidentified trauma patients at Bir Hospital and Kanti Children\'s Hospital correlate strongly with open disaster missing cases. Verification specialists must inspect side-by-side records.')}
            </p>
          </div>
        </div>
      )}

      {/* FOOTER & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Cpu className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          {t('AI decision support engine • Human verification required for all closures')}
        </span>
        {onOpenPortal && (
          <Button 
            onClick={onOpenPortal} 
            variant="primary" 
            size="sm"
            className="w-full sm:w-auto font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5"
          >
            {t('Open Hospital Matching Portal')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
