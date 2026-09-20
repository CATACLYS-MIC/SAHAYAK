import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, 
  AlertTriangle, ArrowRight, RefreshCw, Eye, ShieldCheck, Database, Layers
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { HospitalPatientRecord, HospitalSex } from '@/types';

interface HospitalBatchProcessorProps {
  onBatchComplete?: () => void;
}

const SIMULATED_DISASTER_BATCH_PAYLOAD: Array<Omit<HospitalPatientRecord, 'id' | 'status' | 'potentialMatchesCount' | 'isSimulated' | 'submittedAt'>> = [
  {
    mrn: 'BH-BATCH-2026-001',
    hospitalName: 'Bir Hospital Central Trauma Center, Kathmandu',
    ward: 'Trauma Hall Bed 12',
    admissionDateTime: '2026-09-11 09:10 AM',
    foundLocation: 'Balkhu bridge debris',
    approximateAge: '32-35',
    sex: 'MALE' as HospitalSex,
    approximateHeight: '5ft 9in',
    clothingAppearance: 'Tattered navy blue waterproof jacket, jeans, hiking boots',
    distinguishingCharacteristics: 'Short black hair, faint scar on left forearm',
    notes: 'Clinging to riverbank debris. Conscious but cold.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Disaster Rapid Intake Team Alpha',
  },
  {
    mrn: 'KTM-BATCH-2026-002',
    hospitalName: "Kanti Children's Hospital, Maharajgunj, Kathmandu",
    ward: 'Pediatric Triage Ward',
    admissionDateTime: '2026-09-11 09:15 AM',
    foundLocation: 'Dhobi Khola residential perimeter',
    approximateAge: '7-9',
    sex: 'FEMALE' as HospitalSex,
    approximateHeight: '3ft 10in',
    clothingAppearance: 'Navy school uniform skirt, white shirt, red hair ribbons',
    distinguishingCharacteristics: 'Red hair ribbons, red pencil pouch',
    notes: 'Unaccompanied minor brought by rescue boat.',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Pediatric Disaster Desk',
  },
  {
    mrn: 'CMC-BATCH-2026-003',
    hospitalName: 'Chitwan Medical College & Teaching Hospital, Bharatpur',
    ward: 'Elderly Observation Bed 4',
    admissionDateTime: '2026-09-11 09:20 AM',
    foundLocation: 'Narayangarh Highway landslide waiting area',
    approximateAge: '60-65',
    sex: 'MALE' as HospitalSex,
    approximateHeight: '5ft 6in',
    clothingAppearance: 'Grey woolen cardigan, black formal pants, Dhaka Topi',
    distinguishingCharacteristics: 'Silver hair, wire glasses, wooden cane',
    notes: 'Disoriented senior traveler.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Emergency Medicine Desk',
  },
  {
    mrn: 'TUTH-BATCH-2026-004',
    hospitalName: 'Tribhuvan University Teaching Hospital (TUTH), Maharajgunj',
    ward: 'General Medicine Bed 18',
    admissionDateTime: '2026-09-11 09:25 AM',
    foundLocation: 'Bishnumati riverbank near Balaju',
    approximateAge: '45-50',
    sex: 'FEMALE' as HospitalSex,
    approximateHeight: '5ft 2in',
    clothingAppearance: 'Yellow kurta, white salwar, green dupatta',
    distinguishingCharacteristics: 'Gold nose stud, glass bangles',
    notes: 'Mild lacerations on lower limbs, stable vitals.',
    photo: '',
    submittedBy: 'Disaster Triage Unit',
  },
  {
    mrn: 'PATAN-BATCH-2026-005',
    hospitalName: 'Patan Hospital Emergency Department, Lalitpur',
    ward: 'ER Cubicle 07',
    admissionDateTime: '2026-09-11 09:30 AM',
    foundLocation: 'Patan Sundhara flood recess',
    approximateAge: '22-26',
    sex: 'MALE' as HospitalSex,
    approximateHeight: '5ft 8in',
    clothingAppearance: 'Red hoodie, grey sweatpants, black running shoes',
    distinguishingCharacteristics: 'Silver ring on thumb, smartwatch with cracked screen',
    notes: 'Recovered from trapped vehicle. Treated for mild smoke inhalation.',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Lalitpur Rescue Medical Team',
  }
];

export function HospitalBatchProcessor({ onBatchComplete }: HospitalBatchProcessorProps) {
  const { submitHospitalPatientBatch } = useAppState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [batchResultSummary, setBatchResultSummary] = useState<{
    processedCount: number;
    matchesFound: number;
  } | null>(null);

  const handleStartBatch = async () => {
    setIsProcessing(true);
    setBatchResultSummary(null);

    try {
      const res = await submitHospitalPatientBatch(
        SIMULATED_DISASTER_BATCH_PAYLOAD,
        (step, percent) => {
          setCurrentStepText(step);
          setProgressPercent(percent);
        }
      );

      setBatchResultSummary(res);
      if (onBatchComplete) {
        onBatchComplete();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Disaster Mass-Casualty Batch Intake Processor
            </h3>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400">
              SIMULATED PIPELINE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed for multi-facility surge when rescue teams transfer dozens of unidentified patients simultaneously
          </p>
        </div>
      </div>

      {/* PIPELINE STAGES VISUALIZER */}
      <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-teal-600" />
            AI Batch Ingestion & Vector Matching Pipeline
          </span>
          <span className="font-mono text-teal-600 dark:text-teal-400">{progressPercent}%</span>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* PIPELINE STEP BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] text-center pt-1 font-medium">
          <div className={progressPercent >= 15 ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}>
            1. Uploading Bundles
          </div>
          <div className={progressPercent >= 40 ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}>
            2. Image Normalization
          </div>
          <div className={progressPercent >= 65 ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}>
            3. Multi-Signal Vector Alignment
          </div>
          <div className={progressPercent >= 85 ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}>
            4. Database & Corridor Scan
          </div>
          <div className={progressPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
            5. Potential Matches Flagged
          </div>
        </div>

        {isProcessing && (
          <div className="text-xs text-center font-medium text-teal-700 dark:text-teal-300 animate-pulse pt-2">
            Current Stage: {currentStepText}
          </div>
        )}
      </div>

      {/* BATCH PAYLOAD PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            Pre-Formatted Disaster Intake Payload (5 Multi-Hospital Records):
          </span>
          <span className="text-[11px] text-slate-500">
            Source: Nepal MoHP / Kathmandu Emergency Triage Cluster
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">MRN</th>
                <th className="py-2.5 px-3">Hospital & Ward</th>
                <th className="py-2.5 px-3">Found Location</th>
                <th className="py-2.5 px-3">Demographics</th>
                <th className="py-2.5 px-3">Key Identifiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {SIMULATED_DISASTER_BATCH_PAYLOAD.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="py-2 px-3 font-mono font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                    {row.mrn}
                  </td>
                  <td className="py-2 px-3 text-[11px]">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{row.hospitalName.split(',')[0]}</div>
                    <div className="text-slate-500 text-[10px]">{row.ward}</div>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                    {row.foundLocation}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-[11px]">
                    {row.approximateAge} • {row.sex}
                  </td>
                  <td className="py-2 px-3 text-[11px] max-w-xs truncate text-slate-600 dark:text-slate-400">
                    {row.clothingAppearance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BATCH EXECUTION SUCCESS BANNER */}
      {batchResultSummary && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              Batch Ingestion & AI Correlation Complete!
            </p>
            <p className="text-emerald-800 dark:text-emerald-300 mt-1">
              Successfully processed <strong className="font-bold">{batchResultSummary.processedCount} hospital patient records</strong>.
              The AI Engine identified <strong className="font-bold underline">{batchResultSummary.matchesFound} potential match candidates</strong> requiring authorized human review.
              Audit logs have been generated for all records.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          Batch processing adheres to National Disaster Health Data Privacy standards.
        </span>

        <Button
          onClick={handleStartBatch}
          disabled={isProcessing}
          variant="primary"
          className="w-full sm:w-auto font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Processing Pipeline ({progressPercent}%)...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Run 1-Click Mass-Casualty Ingestion Pipeline
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
