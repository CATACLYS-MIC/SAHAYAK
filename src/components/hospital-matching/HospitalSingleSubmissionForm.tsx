import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Camera, Upload, Sparkles, AlertCircle, CheckCircle2, 
  Building2, MapPin, Calendar, Clock, User, ShieldCheck, RefreshCw, FileText
} from 'lucide-react';
import { HospitalPatientRecord, HospitalSex } from '@/types';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';

interface HospitalSingleSubmissionFormProps {
  onSubmitted?: (patientId: string) => void;
}

const SAMPLE_PRESETS = [
  {
    label: 'Preset 1: Melamchi River Flood Survivor (Matches Aarav Thapa)',
    mrn: 'BH-TR-2026-9901',
    hospitalName: 'Bir Hospital Central Trauma Center, Kathmandu',
    ward: 'Trauma Acute ICU Bed 08',
    admissionDateTime: '2026-09-11 08:30 AM',
    foundLocation: 'Balkhu Bridge flood debris, Bagmati basin',
    approximateAge: '32-35',
    sex: 'MALE' as HospitalSex,
    approximateHeight: '~5ft 9in (175 cm)',
    clothingAppearance: 'Tattered navy blue waterproof hooded jacket, dark jeans, brown hiking boots in personal effects bag',
    distinguishingCharacteristics: 'Athletic build, short black hair, faint scar on left forearm, dark grey backpack recovered nearby',
    notes: 'APF water rescue unit retrieved patient clinging to riverbank debris. Conscious but hypothermic.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Dr. S. Koirala, MD (Senior Trauma Registrar)',
  },
  {
    label: 'Preset 2: Rescued Schoolchild (Matches Sita Sharma)',
    mrn: 'KTM-PED-2026-4412',
    hospitalName: "Kanti Children's Hospital, Maharajgunj, Kathmandu",
    ward: 'Pediatric Emergency Observation Bed 05',
    admissionDateTime: '2026-09-11 08:15 AM',
    foundLocation: 'Ground floor residence near Dhobi Khola corridor',
    approximateAge: '7-9',
    sex: 'FEMALE' as HospitalSex,
    approximateHeight: '~3ft 10in (117 cm)',
    clothingAppearance: 'Navy blue pleated school uniform skirt, white collared shirt, red ribbons in braided hair',
    distinguishingCharacteristics: 'Long dark braided hair with red ribbons, red school pencil pouch recovered',
    notes: 'Rescued by neighbors with safety ropes. In mild state of shock. Awaiting parent identification.',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Sister Anupa Shrestha, RN (Pediatric Desk)',
  },
  {
    label: 'Preset 3: Senior with Dhaka Topi (Matches Bikram Gurung)',
    mrn: 'CMC-OPD-2026-8831',
    hospitalName: 'Chitwan Medical College & Teaching Hospital, Bharatpur',
    ward: 'Geriatric Triage Bed 03',
    admissionDateTime: '2026-09-11 09:00 AM',
    foundLocation: 'Narayangarh Highway landslide waiting shed',
    approximateAge: '60-65',
    sex: 'MALE' as HospitalSex,
    approximateHeight: '~5ft 6in (168 cm)',
    clothingAppearance: 'Grey woolen buttoned cardigan sweater, black formal trousers, traditional Dhaka Topi',
    distinguishingCharacteristics: 'Silver hair, wire-rimmed glasses, carved wooden walking stick, medical alert band for insulin dependency',
    notes: 'Disoriented senior found during traffic gridlock. Blood glucose normalized with IV insulin.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    submittedBy: 'Dr. P. Sharma (Emergency Medicine Officer)',
  },
  {
    label: 'Preset 4: Unidentified Woman (No Strong Match in Database)',
    mrn: 'TUTH-EM-2026-3390',
    hospitalName: 'Tribhuvan University Teaching Hospital (TUTH), Maharajgunj',
    ward: 'General Medicine Ward 4',
    admissionDateTime: '2026-09-11 09:30 AM',
    foundLocation: 'Bishnumati bank near Gongabu bus park',
    approximateAge: '45-50',
    sex: 'FEMALE' as HospitalSex,
    approximateHeight: '~5ft 2in',
    clothingAppearance: 'Yellow cotton kurta, white salwar, red bangles',
    distinguishingCharacteristics: 'Gold nose pin, speaks Maithili and Nepali',
    notes: 'Brought in by local volunteers. Resting and stable.',
    photo: '',
    submittedBy: 'Staff Nurse S. Dahal',
  }
];

export function HospitalSingleSubmissionForm({ onSubmitted }: HospitalSingleSubmissionFormProps) {
  const { submitHospitalPatient, governmentHospitals, hospitalAccessRole } = useAppState();

  const [mrn, setMrn] = useState(`BH-TR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [hospitalName, setHospitalName] = useState('Bir Hospital Central Trauma Center, Kathmandu');
  const [ward, setWard] = useState('Trauma ICU, Bed 06');
  const [admissionDateTime, setAdmissionDateTime] = useState('2026-09-11 08:30 AM');
  const [foundLocation, setFoundLocation] = useState('Balkhu Bridge flood debris, Bagmati corridor');
  const [approximateAge, setApproximateAge] = useState('30-35');
  const [sex, setSex] = useState<HospitalSex>('MALE');
  const [approximateHeight, setApproximateHeight] = useState('~5ft 9in (175 cm)');
  const [clothingAppearance, setClothingAppearance] = useState('Torn navy blue hooded waterproof jacket, dark jeans, brown hiking boots in bag');
  const [distinguishingCharacteristics, setDistinguishingCharacteristics] = useState('Athletic build, short black hair, slight stubble, faint scar on left forearm, dark grey backpack');
  const [notes, setNotes] = useState('Patient rescued from river bank by emergency water unit. Semi-conscious upon intake.');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
  const [submittedBy, setSubmittedBy] = useState(
    hospitalAccessRole === 'HOSPITAL_STAFF' 
      ? 'Dr. S. Koirala, MD (Senior Trauma Registrar)' 
      : 'Authorized Hospital Intake Desk'
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    patient: HospitalPatientRecord;
    matchCount: number;
  } | null>(null);

  const applyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setMrn(preset.mrn);
    setHospitalName(preset.hospitalName);
    setWard(preset.ward);
    setAdmissionDateTime(preset.admissionDateTime);
    setFoundLocation(preset.foundLocation);
    setApproximateAge(preset.approximateAge);
    setSex(preset.sex);
    setApproximateHeight(preset.approximateHeight);
    setClothingAppearance(preset.clothingAppearance);
    setDistinguishingCharacteristics(preset.distinguishingCharacteristics);
    setNotes(preset.notes);
    setPhoto(preset.photo);
    setSubmittedBy(preset.submittedBy);
    setSubmissionSuccess(null);
  };

  const handleGenerateMrn = () => {
    const prefix = hospitalName.includes('Bir') ? 'BH-TR' : hospitalName.includes('Kanti') ? 'KTM-PED' : hospitalName.includes('Chitwan') ? 'CMC-OPD' : 'HOSP-DIS';
    setMrn(`${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      setAnalysisStep('Uploading photographic and clinical intake data...');
      await new Promise(r => setTimeout(r, 500));

      setAnalysisStep('Extracting demographic & visual descriptors...');
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep('Evaluating multi-signal compatibility against Missing-Person Database...');
      await new Promise(r => setTimeout(r, 700));

      setAnalysisStep('Searching spatial flood drainage corridors & timeline sequences...');
      await new Promise(r => setTimeout(r, 600));

      const result = await submitHospitalPatient({
        mrn,
        hospitalName,
        ward,
        admissionDateTime,
        foundLocation,
        approximateAge,
        sex,
        approximateHeight,
        clothingAppearance,
        distinguishingCharacteristics,
        notes,
        photo: photo || undefined,
        submittedBy,
      });

      setSubmissionSuccess({
        patient: result.patient,
        matchCount: result.matches.length,
      });

      if (onSubmitted) {
        onSubmitted(result.patient.id);
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      
      {/* HEADER & QUICK PRESETS */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Submit Unidentified Patient Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized clinical portal for emergency trauma departments & field clinics
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400">
            SIMULATED DEMO MODE
          </Badge>
        </div>

        {/* 1-CLICK DEMO SELECTORS */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            1-Click Demonstration Pre-fills:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-[11px] text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
              >
                <span className="font-bold block text-teal-700 dark:text-teal-400 truncate">
                  {preset.label.split(':')[0]}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {preset.label.split(':')[1]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {submissionSuccess && (
        <div className="my-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              Patient Record Successfully Submitted & Analyzed!
            </p>
            <p className="text-emerald-800 dark:text-emerald-300 mt-1">
              Patient MRN <strong className="font-mono">{submissionSuccess.patient.mrn}</strong> cataloged at {submissionSuccess.patient.hospitalName}.
              {submissionSuccess.matchCount > 0 ? (
                <> The AI Engine identified <strong className="font-bold underline">{submissionSuccess.matchCount} potential candidate match(es)</strong> in the missing-person database. Navigate to the <strong>AI Match Center</strong> to review the side-by-side dossier.</>
              ) : (
                <> <strong className="font-bold">No strong potential match found.</strong> (Note: This does not constitute proof that the person is not in the missing-person database; missing-person reports may still be pending or under investigation).</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        
        {/* ROW 1: MRN & HOSPITAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Medical Record No. (MRN) *</span>
              <button 
                type="button" 
                onClick={handleGenerateMrn}
                className="text-[10px] text-teal-600 hover:underline flex items-center gap-0.5"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Generate
              </button>
            </label>
            <input 
              type="text" 
              required
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. BH-TR-2026-0891"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admitting Hospital *
            </label>
            <select
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Bir Hospital Central Trauma Center, Kathmandu">Bir Hospital Central Trauma Center, Kathmandu</option>
              <option value="Kanti Children's Hospital, Maharajgunj, Kathmandu">Kanti Children's Hospital, Maharajgunj, Kathmandu</option>
              <option value="Tribhuvan University Teaching Hospital (TUTH), Maharajgunj">Tribhuvan University Teaching Hospital (TUTH), Maharajgunj</option>
              <option value="Patan Hospital Emergency Department, Lalitpur">Patan Hospital Emergency Department, Lalitpur</option>
              <option value="Chitwan Medical College & Teaching Hospital, Bharatpur">Chitwan Medical College & Teaching Hospital, Bharatpur</option>
              <option value="Western Regional Hospital, Pokhara">Western Regional Hospital, Pokhara</option>
              <option value="Melamchi Primary Health Center Field Station">Melamchi Primary Health Center Field Station</option>
              <option value="Dhulikhel Hospital Disaster Trauma Intake, Kavre">Dhulikhel Hospital Disaster Trauma Intake, Kavre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ward & Bed Location *
            </label>
            <input 
              type="text" 
              required
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Trauma ICU Bed 04"
            />
          </div>
        </div>

        {/* ROW 2: ADMISSION TIME & RECOVERY LOCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Date & Time of Admission *</span>
              <button 
                type="button" 
                onClick={() => setAdmissionDateTime(new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }))}
                className="text-[10px] text-teal-600 hover:underline"
              >
                Set Current Time
              </button>
            </label>
            <input 
              type="text" 
              required
              value={admissionDateTime}
              onChange={(e) => setAdmissionDateTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. 2026-09-11 08:30 AM"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location Where Patient Was Found / Retrieved *
            </label>
            <input 
              type="text" 
              required
              value={foundLocation}
              onChange={(e) => setFoundLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Balkhu Bridge flood debris, Bagmati river basin"
            />
          </div>
        </div>

        {/* ROW 3: DEMOGRAPHICS (AGE, SEX, HEIGHT) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Approximate Age or Range *
            </label>
            <input 
              type="text" 
              required
              value={approximateAge}
              onChange={(e) => setApproximateAge(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. 30-35 or 8 or 60+"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sex / Gender Observation *
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as HospitalSex)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="UNKNOWN">Unknown / Undetermined</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Approximate Height (if available)
            </label>
            <input 
              type="text" 
              value={approximateHeight}
              onChange={(e) => setApproximateHeight(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. ~5ft 9in (175 cm)"
            />
          </div>
        </div>

        {/* ROW 4: PHOTO URL / ATTACHMENT */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Patient Photograph (URL or simulated camera capture)
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="https://... (or leave blank if photograph unavailable)"
            />
            {photo && (
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                <img src={photo} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* ROW 5: CLOTHING & APPEARANCE */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Clothing & Appearance Details *
          </label>
          <textarea 
            required
            rows={2}
            value={clothingAppearance}
            onChange={(e) => setClothingAppearance(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            placeholder="e.g. Navy blue waterproof jacket, jeans, hiking boots, school uniform, colors and patterns..."
          />
        </div>

        {/* ROW 6: DISTINGUISHING CHARACTERISTICS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Distinguishing Visible Characteristics (Scars, Tattoos, Jewelry, Medical Devices, Belongings)
          </label>
          <input 
            type="text" 
            value={distinguishingCharacteristics}
            onChange={(e) => setDistinguishingCharacteristics(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            placeholder="e.g. Scar on left forearm, insulin medical alert wristband, carved walking stick, ear piercing..."
          />
        </div>

        {/* ROW 7: CLINICAL NOTES & SUBMITTING PERSON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clinical / Intake Notes (Hospital Personnel)
            </label>
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Patient semi-conscious, hypothermia, awaiting guardian..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Submitting Medical Officer / Registrar *
            </label>
            <input 
              type="text" 
              required
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Dr. S. Koirala, MD (Senior Trauma Registrar)"
            />
          </div>
        </div>

        {/* ANIMATED PROCESSING STEP */}
        {isAnalyzing && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-teal-600 animate-spin shrink-0" />
            <span className="text-xs font-medium text-teal-800 dark:text-teal-200">
              {analysisStep}
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            All submissions logged into encrypted audit trail.
          </span>

          <Button
            type="submit"
            variant="primary"
            disabled={isAnalyzing}
            className="w-full sm:w-auto font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing & Matching...' : 'Submit Patient & Run AI Match'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
