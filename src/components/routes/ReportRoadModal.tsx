import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { AlertTriangle, MapPin, X, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/lib/store';

interface ReportRoadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportRoadModal({ isOpen, onClose }: ReportRoadModalProps) {
  const { addRoadReport, addCommunityRoadReport, userRole, dorClosures } = useAppState();
  
  const [road, setRoad] = useState('');
  const [district, setDistrict] = useState('Chitwan');
  const [issue, setIssue] = useState<'ROAD_BLOCKED' | 'LANDSLIDE' | 'FLOODED' | 'BRIDGE_DAMAGED' | 'ROUGH_PASSABLE'>('LANDSLIDE');
  const [passableFor, setPassableFor] = useState<'NONE' | 'FOUR_BY_FOUR_ONLY' | 'LIGHT_VEHICLES_ONLY' | 'ALL'>('NONE');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(userRole === 'RESPONDER' ? 'APF Officer / Traffic Police' : 'Local Citizen');
  const [contactInfo, setContactInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isResp = userRole === 'RESPONDER';
    
    // 1. Add to classic RoadReport
    addRoadReport({
      id: `rep-${Date.now()}`,
      locationName: `${road}, ${district}`,
      location: { lat: 27.7, lng: 85.3 },
      issueType: issue as any,
      description: `${description} [Passable: ${passableFor}]`,
      timestamp: new Date().toISOString(),
      status: isResp ? 'VERIFIED' : 'UNVERIFIED',
      reportedBy: reporterName,
      isResponder: isResp
    });

    // 2. Add to enhanced CommunityRoadReport for DOR Route Engine
    addCommunityRoadReport({
      locationName: road,
      district,
      issueType: issue,
      description,
      passableFor,
      sourceType: isResp ? 'VERIFIED_RESPONDER' : 'CITIZEN_REPORT',
      reporterName,
      contactInfo: contactInfo || undefined,
      isConfirmed: isResp
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 shadow-2xl p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report Road Hazard or Blockage</h2>
              <p className="text-xs text-slate-500">Submissions feed directly into SAHAYAK's Disaster-Aware Route Engine</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Road / Highway Name</label>
              <input 
                required
                type="text" 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" 
                placeholder="e.g., Mugling - Narayanghat Section"
                value={road}
                onChange={e => setRoad(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">District</label>
              <select 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                value={district}
                onChange={e => setDistrict(e.target.value)}
              >
                {['Chitwan', 'Dhading', 'Makwanpur', 'Sindhupalchok', 'Kaski', 'Tanahun', 'Gorkha', 'Nawalpur', 'Kathmandu', 'Lalitpur', 'Bhaktapur'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Issue Classification</label>
              <select 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-900 dark:text-slate-100"
                value={issue}
                onChange={e => setIssue(e.target.value as any)}
              >
                <option value="LANDSLIDE">⚠️ Landslide / Rockfall</option>
                <option value="FLOODED">🌊 Highway Flooded / Waterlogged</option>
                <option value="ROAD_BLOCKED">⛔ Road Completely Impassable</option>
                <option value="BRIDGE_DAMAGED">🌉 Bridge Structural Damage / Scour</option>
                <option value="ROUGH_PASSABLE">⚠️ Rough / Muddy / Single Lane</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Passability Assessment</label>
              <select 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-900 dark:text-slate-100"
                value={passableFor}
                onChange={e => setPassableFor(e.target.value as any)}
              >
                <option value="NONE">⛔ Completely Impassable (All Vehicles)</option>
                <option value="FOUR_BY_FOUR_ONLY">🚙 High-Clearance 4x4 / Heavy Rescue Only</option>
                <option value="LIGHT_VEHICLES_ONLY">🛵 Two-wheelers & Light Vehicles Only</option>
                <option value="ALL">✅ Passable with Caution</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Situation Details & Chainage</label>
            <textarea 
              required
              rows={3}
              className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-900 dark:text-slate-100" 
              placeholder="e.g. Mudslide near km 14. Heavy debris across both lanes. Excavator working on site..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reporter Identity</label>
              <input 
                type="text" 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg" 
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact No. / VHF Channel</label>
              <input 
                type="text" 
                className="w-full p-2 text-sm border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg" 
                placeholder="e.g. 9841-XXXXXX or VHF CH-14"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 border border-slate-200 dark:border-slate-800">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              {userRole === 'RESPONDER' ? (
                <strong className="text-emerald-600 dark:text-emerald-400">Official Responder Mode:</strong>
              ) : (
                <strong className="text-amber-600 dark:text-amber-400">Citizen Report:</strong>
              )}{' '}
              {userRole === 'RESPONDER' 
                ? 'Your report will be automatically tagged as VERIFIED and immediately alter emergency route recommendations.'
                : 'Will be tagged as CITIZEN REPORT and flagged for verification by the SAHAYAK Command Center.'}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Submit Report</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
