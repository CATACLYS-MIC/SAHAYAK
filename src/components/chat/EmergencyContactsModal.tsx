import React, { useState } from 'react';
import { 
  Phone, X, ShieldAlert, Check, Copy, ExternalLink, 
  Flame, HeartHandshake, Waves, Car, LifeBuoy, AlertOctagon
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HotlineItem {
  id: string;
  name: string;
  nepaliName: string;
  number: string;
  agency: string;
  description: string;
  icon: any;
  color: string;
  tollFree: boolean;
}

const EMERGENCY_HOTLINES: HotlineItem[] = [
  {
    id: 'police',
    name: 'Nepal Police Emergency Control',
    nepaliName: 'नेपाल प्रहरी आपतकालीन नियन्त्रण',
    number: '100',
    agency: 'Nepal Police Headquarters',
    description: 'Immediate police intervention, crime response, highway safety, and active accident dispatch.',
    icon: ShieldAlert,
    color: 'bg-blue-500 text-white',
    tollFree: true
  },
  {
    id: 'ambulance',
    name: 'National Emergency Ambulance Service',
    nepaliName: 'नेपाल रेडक्रस / राष्ट्रिय एम्बुलेन्स सेवा',
    number: '102',
    agency: 'Nepal Red Cross Society / MoHP',
    description: 'Emergency medical triage, paramedic ambulances, and hospital trauma transfers across all 77 districts.',
    icon: HeartHandshake,
    color: 'bg-emerald-600 text-white',
    tollFree: true
  },
  {
    id: 'fire',
    name: 'Fire & Rescue Brigade (Damkal)',
    nepaliName: 'दमकल / अग्नि नियन्त्रक सेवा',
    number: '101',
    agency: 'National Fire Services Grid',
    description: 'Urban fire rescue, hazardous chemical spill containment, and structural collapse extraction.',
    icon: Flame,
    color: 'bg-red-600 text-white',
    tollFree: true
  },
  {
    id: 'neoc',
    name: 'National Emergency Operation Centre (NEOC)',
    nepaliName: 'राष्ट्रिय आपतकालीन कार्यसञ्चालन केन्द्र',
    number: '1149',
    agency: 'Ministry of Home Affairs (MoHA) / NDRRMA',
    description: 'National disaster command coordination, flood relief mobilization, and multi-agency response.',
    icon: AlertOctagon,
    color: 'bg-purple-600 text-white',
    tollFree: true
  },
  {
    id: 'army',
    name: 'Nepal Army Disaster Relief Helpline',
    nepaliName: 'नेपाली सेना विपद् उद्धार निर्देशनालय',
    number: '1114',
    agency: 'Nepal Army Aviation & Disaster Relief',
    description: 'Aviation air-evacuation, deep water diver deployment, and alpine mountain search and rescue.',
    icon: LifeBuoy,
    color: 'bg-amber-600 text-white',
    tollFree: true
  },
  {
    id: 'apf',
    name: 'Armed Police Force Disaster Management Unit',
    nepaliName: 'सशस्त्र प्रहरी बल विपद् व्यवस्थापन',
    number: '1114',
    agency: 'Armed Police Force (APF Nepal)',
    description: 'Swift-water rafting rescue, canine search units, and disaster containment battalions.',
    icon: ShieldAlert,
    color: 'bg-indigo-600 text-white',
    tollFree: true
  },
  {
    id: 'traffic',
    name: 'Traffic Police Highway Safety Helpline',
    nepaliName: 'ट्राफिक प्रहरी राजमार्ग सहायता',
    number: '103',
    agency: 'Traffic Police Directorate',
    description: 'Highway blockage notifications, landslide road status, and stranded motorist guidance.',
    icon: Car,
    color: 'bg-cyan-600 text-white',
    tollFree: true
  },
  {
    id: 'dhm',
    name: 'DHM Flood Warning & Hydrology Advisory',
    nepaliName: 'बाढी पूर्वसूचना हटलाइन (जल तथा मौसम)',
    number: '1155',
    agency: 'Department of Hydrology & Meteorology (DHM)',
    description: '24/7 automated and manned river water levels, flood risk forecasts, and dam discharge bulletins.',
    icon: Waves,
    color: 'bg-teal-600 text-white',
    tollFree: true
  }
];

export function EmergencyContactsModal({ isOpen, onClose }: EmergencyContactsModalProps) {
  const { t } = useTranslation();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
              <Phone className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('emergency.official_contacts', 'Official Emergency Hotlines (Nepal)')}
              </h2>
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                {t('emergency.toll_free_all', 'Available 24/7 • Toll-Free Emergency Dispatch Across Nepal')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hotlines List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {EMERGENCY_HOTLINES.map((item) => {
            const Icon = item.icon;
            const isCopied = copiedNumber === item.number;
            return (
              <div key={item.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-xl ${item.color} shadow-xs shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.nepaliName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.agency} • {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {item.number}
                  </span>
                  
                  <button
                    onClick={() => handleCopy(item.number)}
                    title="Copy Hotline Number"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>

                  <a
                    href={`tel:${item.number}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          In severe life-threatening disasters, stay calm, identify your nearest prominent landmark, and state your exact district and coordinates clearly to the emergency operator.
        </div>
      </div>
    </div>
  );
}
